import {
    ControlElement,
    customElements,
    Icon,
    Label,
    Module,
    moment,
    Panel,
    StackLayout,
    Styles,
} from '@ijstech/components';
import { Utils } from '@ijstech/eth-wallet';
import { tokenStore } from '@scom/scom-token-list';
import ScomNftMinter from '@scom/scom-nft-minter';
import { ISubscriptionDiscountRule } from '@scom/scom-social-sdk';
import { SubscriptionBundle } from './subscriptionBundle';
import { ISubscription } from '../interface';
import { getNFTRecipientWalletAddress } from '../utils';

const Theme = Styles.Theme.ThemeVars;

type onSubscribedCallback = () => void;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-subscription-module']: SubscriptionModuleElement;
        }
    }
}

interface SubscriptionModuleElement extends ControlElement {
    onSubscribed?: onSubscribedCallback;
}

@customElements('i-scom-subscription-module')
export class SubscriptionModule extends Module {
    private lblOfferPrice: Label;
    private pnlOffer: Panel;
    private bundleWrapper: StackLayout;
    private iconCollapse: Icon;
    private pnlSubscriptionBundles: StackLayout;
    private _data: ISubscription;
    private nftMinter: ScomNftMinter;
    onSubscribed: onSubscribedCallback;

    setData(data: ISubscription) {
        this._data = data;
        this.updateUI();
    }

    async checkUserSubscription(chainId: number, nftAddress: string): Promise<{ isSubscribed: boolean, startTime?: number, endTime?: number }> {
        return { isSubscribed: false };
    }

    private updateUI() {
        this.bundleWrapper.visible = false;
        this.pnlSubscriptionBundles.clearInnerHTML();
        this.pnlOffer.visible = true;
        const dayText = this._data.durationInDays > 1 ? `for ${this._data.durationInDays} days` : 'per day';
        const address = this._data.currency === Utils.nullAddress ? undefined : this._data.currency;
        let token = tokenStore.getTokenList(this._data.chainId).find(v => v.address === address);
        this.lblOfferPrice.caption = `${this._data.price} ${token?.symbol || ""} ${dayText}`;
        this.renderSubscriptionBundles(token?.symbol || '');
    }

    private handleSubscribeButtonClick() {
        this.openNFTMinter();
    }
    
    async _checkUserSubscription() {
        const subscriptionInfo = await this.checkUserSubscription(this._data.chainId, this._data.tokenAddress);
        this.nftMinter.isRenewal = subscriptionInfo.isSubscribed;
        if (subscriptionInfo.isSubscribed) this.nftMinter.renewalDate = subscriptionInfo.endTime;
    }

    private async openNFTMinter(discountRuleId?: number) {
        if (!this.nftMinter) {
            this.nftMinter = new ScomNftMinter();
            this.nftMinter.display = 'block';
            this.nftMinter.margin = { top: '1rem' };
        }
        this.nftMinter.onMintedNFT = async () => {
            this.nftMinter.closeModal();
            if (this.onSubscribed) this.onSubscribed();
        }
        this.nftMinter.openModal({
            title: 'Mint NFT to unlock content',
            width: '38rem',
            zIndex: 200,
            popupPlacement: 'top',
            padding: { top: "1rem", bottom: "1rem", left: "1.5rem", right: "1.5rem" },
            closeOnBackdropClick: false,
        });
        await this.nftMinter.ready();
        this.nftMinter.showLoading();
        await this._checkUserSubscription();
        const walletAddress = getNFTRecipientWalletAddress();
        const builder = this.nftMinter.getConfigurators('customNft').find((conf: any) => conf.target === 'Builders');
        builder.setData({
            productType: 'Subscription',
            nftType: this._data.tokenType,
            chainId: this._data.chainId,
            nftAddress: this._data.tokenAddress,
            erc1155Index: this._data.tokenId,
            recipient: walletAddress,
            discountRuleId: discountRuleId,
            referrer: this._data.referrer
        });
    }

    init() {
        super.init();
        this.openNFTMinter = this.openNFTMinter.bind(this);
        this.onSubscribeBundle = this.onSubscribeBundle.bind(this);
    }

    private onSubscribeBundle(subscription: ISubscriptionDiscountRule) {
        this.openNFTMinter(subscription.id);
    }

    private onCollapse() {
        this.pnlSubscriptionBundles.visible = !this.pnlSubscriptionBundles.visible;
        this.iconCollapse.name = this.pnlSubscriptionBundles.visible ? 'angle-up' : 'angle-down';
    }

    private renderSubscriptionBundles(symbol: string) {
        const now = Math.round(Date.now() / 1000);
        const filteredRules = this._data?.discountRules?.filter(rule => {
            return (!rule.startTime && !rule.endTime) || (now >= rule.startTime && now <= rule.endTime)
        }) || [];
        if (!filteredRules?.length) return;
        this.pnlSubscriptionBundles.clearInnerHTML();
        for (const subscription of filteredRules) {
            const bundle = new SubscriptionBundle(undefined, {
                width: '100%',
                data: {
                    ...subscription,
                    basePrice: this._data.price,
                    tokenSymbol: symbol
                }
            });
            this.pnlSubscriptionBundles.appendChild(bundle);
            bundle.onSubscribeBundle = this.onSubscribeBundle;
        }
        this.bundleWrapper.visible = true;
    }

    render() {
        return (
            <i-stack
                direction="vertical"
                border={{ top: { width: 1, style: 'solid', color: Theme.divider } }}
                wrap="wrap"
            >
                <i-label
                    width="100%"
                    padding={{ top: '0.75rem', bottom: '0.75rem', left: '0.75rem', right: '0.75rem' }}
                    font={{ size: '1rem', weight: 600, color: Theme.text.secondary, transform: 'uppercase' }}
                    lineHeight={1.5}
                    caption="Subscription"
                />
                <i-stack direction="vertical" padding={{ bottom: '0.75rem' }}>
                    <i-panel
                        id="pnlOffer"
                        maxWidth="100%"
                        stack={{ grow: '1', shrink: '1', basis: '0' }}
                        visible={false}
                    >
                        <i-panel padding={{ left: '0.75rem', right: '0.75rem' }}>
                            <i-stack
                                gap="1rem"
                                direction="horizontal"
                                alignItems="center"
                                justifyContent="space-between"
                                minHeight={36}
                                width="100%"
                                padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
                                border={{ radius: 18 }}
                                background={{ color: Theme.colors.primary.main }}
                                stack={{ grow: '1', shrink: '1', basis: '0' }}
                                cursor="pointer"
                                onClick={this.handleSubscribeButtonClick}
                            >
                                <i-label
                                    class="text-center"
                                    font={{ size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText, transform: 'uppercase' }}
                                    lineHeight={1.5}
                                    caption="Subscribe"
                                />
                                <i-label
                                    id="lblOfferPrice"
                                    class="text-center"
                                    font={{ size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText }}
                                    lineHeight={1.5}
                                />
                            </i-stack>
                        </i-panel>
                        <i-stack
                            id="bundleWrapper"
                            visible={false}
                            gap="0.5rem"
                            direction="vertical"
                            alignItems="center"
                            justifyContent="space-between"
                            width="100%"
                            margin={{ top: '1rem' }}
                            border={{ top: { width: 1, style: 'solid', color: Theme.divider } }}
                        >
                            <i-stack
                                gap="1rem"
                                direction="horizontal"
                                alignItems="center"
                                justifyContent="space-between"
                                width="100%"
                                padding={{ top: '0.75rem', bottom: '0.75rem', left: '0.75rem', right: '0.75rem' }}
                                cursor="pointer"
                                hover={{ backgroundColor: Theme.action.hoverBackground }}
                                onClick={this.onCollapse}
                            >
                                <i-label
                                    caption="Subscription Bundles"
                                    font={{ size: '1rem', weight: 600, color: Theme.text.secondary, transform: 'uppercase' }}
                                />
                                <i-icon
                                    id="iconCollapse"
                                    name="angle-up"
                                    width={20}
                                    height={20}
                                    fill={Theme.text.secondary}
                                />
                            </i-stack>
                            <i-stack
                                id="pnlSubscriptionBundles"
                                gap="1rem"
                                width="100%"
                                direction="vertical"
                                alignItems="center"
                                padding={{ left: '0.75rem', right: '0.75rem' }}
                            />
                        </i-stack>
                    </i-panel>
                </i-stack>
            </i-stack>
        )
    }
}