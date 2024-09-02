import {
    Module,
    customElements,
    Styles,
    ControlElement,
    StackLayout,
    Label,
    Panel,
    Icon,
    application,
    Image,
    FormatUtils,
} from '@ijstech/components';
import { ICommissionInfo, ISubscriptionAffiliate } from './interface';
import { imageStyle, preWrapStyle } from './index.css';
import { checkIsLoggedIn, fetchCommunityInfo, getCommunityBasicInfoFromUri } from './utils';
import { ICommunityInfo, MembershipType, PaymentModel, SocialDataManager } from '@scom/scom-social-sdk';
import formSchema from './formSchema';
import { SubscriptionModule } from './components';
import { BigNumber } from '@ijstech/eth-wallet';


interface ScomSubscriptionAffiliateElement extends ControlElement { }

const Theme = Styles.Theme.ThemeVars;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-subscription-affiliate']: ScomSubscriptionAffiliateElement;
        }
    }
}

@customElements('i-scom-subscription-affiliate')
export default class ScomSubscriptionAffiliate extends Module {
    private imgBanner: Image;
    private pnlAvatar: Panel;
    private imgAvatar: Image;
    private lblName: Label;
    private lblPubkey: Label;
    private imgCopy: Icon;
    private pnlParentCommunity: StackLayout;
    private lblParentCommunity: Label;
    private lblDescription: Label;
    private lblCommunityType: Label;
    private subscriptionModule: SubscriptionModule;
    private _data: ISubscriptionAffiliate;
    private _dataManager: SocialDataManager;
    private communityInfo: ICommunityInfo;
    private copyTimer: any;
    private commissions: ICommissionInfo[];

    get dataManager() {
        return this._dataManager || application.store?.mainDataManager;
    }

    set dataManager(manager: SocialDataManager) {
        this._dataManager = manager;
    }

    init() {
        super.init();
    }

    private async setData(data: ISubscriptionAffiliate) {
        this._data = data;
        this.clear();
        if (this._data.communityUri) {
            const parts = this._data.communityUri.split('/');
            this._data.communityId = parts[0];
            this._data.creatorId = parts[1];
        }
        this.communityInfo = await fetchCommunityInfo(this.dataManager, this._data.communityId, this._data.creatorId);
        if (this.communityInfo) this.updateUI();
    }

    private getData() {
        return this._data;
    }

    private getTag() {
        return this.tag;
    }

    private updateTag(type: 'light' | 'dark', value: any) {
        this.tag[type] = this.tag[type] ?? {};
        for (let prop in value) {
            if (value.hasOwnProperty(prop))
                this.tag[type][prop] = value[prop];
        }
    }

    private async setTag(value: any) {
        const newValue = value || {};
        for (let prop in newValue) {
            if (newValue.hasOwnProperty(prop)) {
                if (prop === 'light' || prop === 'dark')
                    this.updateTag(prop, newValue[prop]);
                else
                    this.tag[prop] = newValue[prop];
            }
        }
        this.updateTheme();
    }

    private updateStyle(name: string, value: any) {
        value ?
            this.style.setProperty(name, value) :
            this.style.removeProperty(name);
    }

    private updateTheme() {
        const themeVar = document.body.style.getPropertyValue('--theme') || 'dark';
        this.updateStyle('--text-primary', this.tag[themeVar]?.fontColor);
        this.updateStyle('--background-main', this.tag[themeVar]?.backgroundColor);
        this.updateStyle('--input-font_color', this.tag[themeVar]?.inputFontColor);
        this.updateStyle('--input-background', this.tag[themeVar]?.inputBackgroundColor);
        this.updateStyle('--colors-primary-main', this.tag[themeVar]?.buttonBackgroundColor);
    }

    private clear() {
        this.imgBanner.url = "";
        this.imgAvatar.url = "";
        this.pnlAvatar.visible = false;
        this.lblName.caption = "";
        this.lblDescription.caption = "";
        this.lblPubkey.caption = "";
        this.lblCommunityType.visible = false;
        this.pnlParentCommunity.visible = false;
        this.lblParentCommunity.caption = "";
        this.subscriptionModule.visible = false;
        this.commissions = [];
    }

    private updateUI() {
        this.imgBanner.url = this.communityInfo.bannerImgUrl;
        this.imgAvatar.url = this.communityInfo.avatarImgUrl;
        this.pnlAvatar.visible = !!this.communityInfo.avatarImgUrl;
        this.lblName.caption = this.communityInfo.communityId;
        this.lblDescription.caption = this.communityInfo.description;
        this.lblPubkey.caption = FormatUtils.truncateWalletAddress(this.communityInfo.creatorId);
        const isExclusive = this.communityInfo.membershipType === MembershipType.Protected;
        this.lblCommunityType.visible = isExclusive;
        if (this.communityInfo.parentCommunityUri) {
            const { communityId } = getCommunityBasicInfoFromUri(this.communityInfo.parentCommunityUri);
            this.pnlParentCommunity.visible = true;
            this.lblParentCommunity.caption = communityId;
        }
        const subscriptions = this.communityInfo.policies?.filter(policy => policy.paymentModel === PaymentModel.Subscription);
        if (subscriptions.length > 0) {
            const subscription = subscriptions[0];
            const commissionRate = new BigNumber(subscription.commissionRate || 0);
            this.commissions = this._data.walletAddress && commissionRate.gt(0) ? [
                {
                    chainId: subscription.chainId,
                    walletAddress: this._data.walletAddress,
                    share: commissionRate.div(100).toFixed()
                }
            ] : [];
            const isLoggedIn = checkIsLoggedIn();
            let isSubscribed = false;
            // if (isLoggedIn) {
            //     const data = await checkUserSubscription(subscription.chainId, subscription.tokenAddress);
            //     isSubscribed = data.isSubscribed;
            // }
            if (isSubscribed) {
                this.subscriptionModule.visible = false;
            } else {
                this.subscriptionModule.setData({
                    chainId: subscription.chainId,
                    tokenAddress: subscription.tokenAddress,
                    tokenType: subscription.tokenType,
                    tokenId: subscription.tokenId,
                    price: subscription.tokenAmount,
                    currency: subscription.currency,
                    durationInDays: subscription.durationInDays,
                    discountRules: subscription.discountRules,
                    commissions: this.commissions
                })
                this.subscriptionModule.visible = true;
            }
        } else {
            this.subscriptionModule.visible = false;
        }
    }

    private getActions() {
        return [
            {
                name: 'Settings',
                userInputDataSchema: formSchema.dataSchema,
                userInputUISchema: formSchema.uiSchema,
            }
        ]
    }

    getConfigurators() {
        return [
            {
                name: 'Builder Configurator',
                target: 'Builders',
                getActions: (category?: string) => {
                    const actions = this.getActions();
                    return actions;
                },
                getData: this.getData.bind(this),
                setData: this.setData.bind(this),
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            },
            {
                name: 'Editor',
                target: 'Editor',
                getActions: (category?: string) => {
                    const actions = this.getActions();
                    return actions;
                },
                getData: this.getData.bind(this),
                setData: this.setData.bind(this),
                getTag: this.getTag.bind(this),
                setTag: this.setTag.bind(this)
            }
        ];
    }

    private async onCopyPubkey() {
        try {
            await application.copyToClipboard(this.communityInfo.creatorId);
            this.imgCopy.name = "check";
            this.imgCopy.fill = Theme.colors.success.main;
            if (this.copyTimer) clearTimeout(this.copyTimer);
            this.copyTimer = setTimeout(() => {
                this.imgCopy.name = "copy";
                this.imgCopy.fill = Theme.text.primary;
            }, 500)
        } catch { }
    }

    private viewParentCommunity() {
        if (!this.communityInfo?.parentCommunityUri) return;
        const { creatorId, communityId } = getCommunityBasicInfoFromUri(this.communityInfo.parentCommunityUri);
        const ensMap = application.store?.ensMap || {};
        const path = communityId + "/" + creatorId;
        let url = `#!/c/${path}`;
        for (let key in ensMap) {
            if (ensMap[key] === path) {
                url = `#!/n/${key}`;
                break;
            }
        }
        window.location.assign(url);
    }

    render() {
        <i-panel background={{ color: Theme.background.paper }}>
            <i-panel position="relative" width="100%" height={0} overflow="hidden" padding={{ bottom: "40%" }}>
                <i-image id="imgBanner" class={imageStyle} position="absolute" display="block" width="100%" height="auto" top="40%" left={0} objectFit="cover"></i-image>
            </i-panel>
            <i-stack direction="vertical" position="relative" padding={{ top: '1.5rem', bottom: '1.25rem', left: '1rem', right: '1rem' }}>
                <i-panel height="0.75rem" width="100%" position="absolute" top={0} left={0} background={{ color: `color-mix(in srgb, ${Theme.background.paper}, #fff 5%)` }} />
                <i-panel id="pnlAvatar" padding={{ bottom: "4rem" }} visible={false}>
                    <i-panel
                        border={{
                            radius: '50%',
                            width: '0.25rem',
                            style: 'solid',
                            color: Theme.background.paper,
                        }}
                        background={{ color: Theme.background.paper }}
                        overflow='hidden'
                        width={'8.875rem'}
                        height={'8.875rem'}
                        position='absolute'
                        top='-5.5rem'
                    >
                        <i-image
                            id='imgAvatar'
                            display="block"
                            width="100%"
                            height="100%"
                            objectFit='cover'
                            border={{ radius: '50%' }}
                            background={{ color: Theme.background.paper }}
                        ></i-image>
                    </i-panel>
                </i-panel>
                <i-stack alignItems='center' justifyContent="space-between" margin={{ bottom: "0.5rem" }}>
                    <i-label id="lblName" font={{ size: '1.75rem', weight: 700 }} lineHeight="2.125rem"></i-label>
                </i-stack>
                <i-stack
                    direction="horizontal"
                    alignItems='center'
                    margin={{ bottom: '0.5rem' }}
                    gap={'0.5rem'}
                    cursor='pointer'
                    opacity={0.4}
                    hover={{ opacity: 1 }}
                    onClick={this.onCopyPubkey}
                >
                    <i-label
                        id='lblPubkey'
                        font={{
                            size: '0.875rem',
                            weight: 400,
                            color: Theme.text.primary,
                        }}
                        lineHeight={'1rem'}
                    ></i-label>
                    <i-icon
                        id='imgCopy'
                        name='copy'
                        width={'1rem'}
                        height={'1rem'}
                        display='inline-flex'
                    ></i-icon>
                </i-stack>
                <i-stack
                    id="pnlParentCommunity"
                    direction="horizontal"
                    width="fit-content"
                    alignItems="center"
                    margin={{ bottom: '0.5rem' }}
                    gap="0.5rem"
                    cursor="pointer"
                    onClick={this.viewParentCommunity}
                    visible={false}
                >
                    <i-icon width="0.9375rem" height="0.9375rem" name="user-friends"></i-icon>
                    <i-label id="lblParentCommunity" font={{ size: '0.9375rem' }}></i-label>
                </i-stack>
                <i-stack direction="horizontal" justifyContent="space-between">
                    <i-label id="lblDescription" class={preWrapStyle} font={{ size: '0.9375rem' }} lineHeight="1.25rem" lineClamp={5} margin={{ top: "0.25rem", bottom: "1rem" }}></i-label>
                </i-stack>
                <i-label
                    id="lblCommunityType"
                    width="fit-content"
                    padding={{ top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }}
                    border={{ width: '1px', style: 'solid', color: Theme.colors.primary.main, radius: '0.375rem' }}
                    font={{ size: '0.9375rem', color: Theme.colors.primary.main }}
                    caption="Exclusive Community"
                    visible={false}
                ></i-label>
            </i-stack>
            <i-scom-subscription-module
                id="subscriptionModule"
                width="100%"
                margin={{ top: '0.5rem', bottom: '0.75rem' }}
                visible={false}
            />
        </i-panel>
    }
}