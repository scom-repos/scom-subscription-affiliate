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
import ScomSubscription from '@scom/scom-subscription';
import { ISubscriptionDiscountRule, PaymentMethod, PaymentModel } from '@scom/scom-social-sdk';
import { SubscriptionBundle } from './subscriptionBundle';
import { ICheckUserSubscription, ISubscription } from '../interface';
import { getUserWalletAddresses } from '../utils';

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
    private subscription: ScomSubscription;
    onSubscribed: onSubscribedCallback;

    setData(data: ISubscription) {
        this._data = data;
        this.updateUI();
    }

    async checkUserSubscription(communityCreatorId: string, communityId: string, paymentMethod?: PaymentMethod): Promise<ICheckUserSubscription> {
        return { isSubscribed: false };
    }

    private updateUI() {
        this.bundleWrapper.visible = false;
        this.pnlSubscriptionBundles.clearInnerHTML();
        this.pnlOffer.visible = true;
        const dayText = this._data.durationInDays > 1 ? `for ${this._data.durationInDays} days` : 'per day';
        const address = this._data.currency === Utils.nullAddress ? undefined : this._data.currency;
        let token = tokenStore.getTokenList(this._data.chainId).find(v => v.address === address);
        const telegram = window['Telegram'];
        if (!token && telegram) {
            token = {
                chainId: undefined,
                name: "Toncoin",
                decimals: 18,
                symbol: "TON",
            };
        }
        this.lblOfferPrice.caption = `${this._data.price} ${token?.symbol || ""} ${dayText}`;
        this.renderSubscriptionBundles(token?.symbol || '');
    }

    private handleSubscribeButtonClick() {
        this.openNFTMinter();
    }
    
    async _checkUserSubscription() {
        try {
            const subscriptionInfo = await this.checkUserSubscription(this._data.creatorId, this._data.communityId);
            this.subscription.isRenewal = subscriptionInfo.isSubscribed;
            if (subscriptionInfo.isSubscribed) this.subscription.renewalDate = subscriptionInfo.endTime;
        } catch (err) {
            console.error(err);
        }
    }

    private createWidget() {
        const widget = new ScomSubscription();
        widget.display = 'block';
        widget.margin = { top: '1rem' };
        widget.onSubscribed = () => {
            widget.closeModal();
            if (this.onSubscribed) this.onSubscribed();
        }
        return widget;
    }

    private async openNFTMinter(discountRuleId?: number) {
        const policy = this._data.policy;
        if (!this.subscription) {
            this.subscription = this.createWidget();
        }
        this.subscription.openModal({
            title: `${policy.paymentModel === PaymentModel.Subscription ? 'Subscribe' : 'Mint NFT'} to Unlock Content`,
            width: '38rem',
            zIndex: 200,
            popupPlacement: 'top',
            padding: { top: "1rem", bottom: "1rem", left: "1.5rem", right: "1.5rem" },
            closeOnBackdropClick: false,
        });
        await this.subscription.ready();
        this.subscription.showLoading();
        await this._checkUserSubscription();
        const walletAddresses = await getUserWalletAddresses();
        const builder = this.subscription.getConfigurators().find((conf: any) => conf.target === 'Builders');
        const data: any = {
            ...policy,
            recipients: walletAddresses,
            creatorId: this._data.creatorId,
            communityId: this._data.communityId,
            discountRuleId: discountRuleId
        };
        builder.setData(data);
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
    
    private getSubscriptionDisplayName(subscription: ISubscriptionDiscountRule) {
        if (subscription.isDisplayAsTitle) {
            return subscription.name;
        } else {
            if (subscription.minDuration) {
                return subscription.minDuration + " Days"
            } else {
                return "Limited Offer"
            }
        }
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
                    name: this.getSubscriptionDisplayName(subscription),
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