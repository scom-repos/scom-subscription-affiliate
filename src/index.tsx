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
    private lblDescription: Label;
    private subscriptionModule: SubscriptionModule;
    private _data: ISubscriptionAffiliate;
    private _dataManager: SocialDataManager;
    private communityInfo: ICommunityInfo;
    private copyTimer: any;

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
        this.subscriptionModule.visible = false;
        this.lblName.link.href = '';
        this.lblName.link.target = '_blank';
    }

    private getCommunityUrl() {
        const ensMap = application.store?.ensMap || {};
        const path = this._data.communityId + "/" + this._data.creatorId;
        let communityUrl = `https://noto.fan/#!/c/${path}`;
        for (let key in ensMap) {
            if (ensMap[key] === path) {
                communityUrl = `https://noto.fan/#!/n/${key}`;
                break;
            }
        }
        return communityUrl;
    }

    private updateUI() {
        this.imgBanner.url = this.communityInfo.bannerImgUrl;
        this.imgAvatar.url = this.communityInfo.avatarImgUrl;
        this.pnlAvatar.visible = !!this.communityInfo.avatarImgUrl;
        this.lblName.caption = this.communityInfo.communityId;
        const communityUrl = this.getCommunityUrl();
        this.lblName.link.href = communityUrl;
        this.lblName.link.target = communityUrl === window.location.origin ? '_self' : '_blank';
        this.lblDescription.caption = this.communityInfo.description;
        const subscriptions = this.communityInfo.policies?.filter(policy => policy.paymentModel === PaymentModel.Subscription);
        if (subscriptions.length > 0) {
            const subscription = subscriptions[0];
            this.subscriptionModule.setData({
                chainId: subscription.chainId,
                tokenAddress: subscription.tokenAddress,
                tokenType: subscription.tokenType,
                tokenId: subscription.tokenId,
                price: subscription.tokenAmount,
                currency: subscription.currency,
                durationInDays: subscription.durationInDays,
                discountRules: subscription.discountRules,
                referrer: this._data.walletAddress
            })
            this.subscriptionModule.visible = true;
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

    render() {
        <i-panel background={{ color: Theme.background.paper }}>
            <i-panel position="relative" width="100%" height={0} overflow="hidden" padding={{ bottom: "25%" }}>
                <i-image id="imgBanner" class={imageStyle} position="absolute" display="block" width="100%" height="auto" top="25%" left={0} objectFit="cover"></i-image>
            </i-panel>
            <i-stack direction="vertical" position="relative" padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}>
                <i-panel height="0.5rem" width="100%" position="absolute" top={0} left={0} background={{ color: `color-mix(in srgb, ${Theme.background.paper}, #fff 5%)` }} />
                <i-panel id="pnlAvatar" padding={{ bottom: "1rem" }} visible={false}>
                    <i-panel
                        border={{
                            radius: '50%',
                            width: '0.25rem',
                            style: 'solid',
                            color: Theme.background.paper,
                        }}
                        background={{ color: Theme.background.paper }}
                        overflow='hidden'
                        width={'4.75rem'}
                        height={'4.75rem'}
                        position='absolute'
                        top='-3.375rem'
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
                <i-stack alignItems='center' justifyContent="space-between" margin={{ bottom: "0.25rem" }}>
                    <i-label id="lblName" font={{ size: '1.75rem', weight: 700 }} lineHeight="2.125rem" link={{ href: '#' }}></i-label>
                </i-stack>
                <i-stack direction="horizontal" justifyContent="space-between">
                    <i-label id="lblDescription" class={preWrapStyle} font={{ size: '0.9375rem' }} lineHeight="1.25rem" lineClamp={1}></i-label>
                </i-stack>
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