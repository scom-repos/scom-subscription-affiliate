/// <reference path="@scom/scom-social-sdk/index.d.ts" />
/// <amd-module name="@scom/scom-subscription-affiliate/interface.ts" />
declare module "@scom/scom-subscription-affiliate/interface.ts" {
    import { IProtectedMembershipPolicy, TokenType } from "@scom/scom-social-sdk";
    export interface ISubscriptionAffiliate {
        communityUri?: string;
        creatorId?: string;
        communityId?: string;
        walletAddress?: string;
    }
    export interface ISubscription {
        chainId: number;
        tokenAddress?: string;
        tokenType?: TokenType;
        tokenId?: number;
        price?: string;
        currency?: string;
        durationInDays?: number;
        discountRules?: ISubscriptionDiscountRule[];
        referrer?: string;
        policy?: IProtectedMembershipPolicy;
    }
    export interface ISubscriptionDiscountRule {
        id: number;
        name: string;
        startTime: number;
        endTime: number;
        minDuration?: number;
        discountType: 'Percentage' | 'FixedAmount';
        discountPercentage?: number;
        fixedPrice?: number;
        discountApplication: number;
    }
    export interface ICommissionInfo {
        chainId: number;
        walletAddress: string;
        share: string;
    }
}
/// <amd-module name="@scom/scom-subscription-affiliate/index.css.ts" />
declare module "@scom/scom-subscription-affiliate/index.css.ts" {
    export const imageStyle: string;
    export const noWrapStyle: string;
    export const preWrapStyle: string;
}
/// <amd-module name="@scom/scom-subscription-affiliate/utils/index.ts" />
declare module "@scom/scom-subscription-affiliate/utils/index.ts" {
    import { ICommunityInfo, SocialDataManager } from "@scom/scom-social-sdk";
    export function fetchCommunityInfo(dataManager: SocialDataManager, communityId: string, creatorId: string): Promise<ICommunityInfo>;
    export function getCommunityBasicInfoFromUri(communityUri: string): import("@scom/scom-social-sdk").ICommunityBasicInfo;
    export function checkIsLoggedIn(): boolean;
    export function getNFTRecipientWalletAddress(): string;
}
/// <amd-module name="@scom/scom-subscription-affiliate/formSchema.ts" />
declare module "@scom/scom-subscription-affiliate/formSchema.ts" {
    const _default: {
        dataSchema: {
            type: string;
            properties: {
                communityUri: {
                    title: string;
                    type: string;
                    placeholder: string;
                    required: boolean;
                };
                walletAddress: {
                    title: string;
                    type: string;
                    format: string;
                };
            };
        };
        uiSchema: {
            type: string;
            elements: {
                type: string;
                scope: string;
            }[];
        };
    };
    export default _default;
}
/// <amd-module name="@scom/scom-subscription-affiliate/components/subscriptionBundle.tsx" />
declare module "@scom/scom-subscription-affiliate/components/subscriptionBundle.tsx" {
    import { ControlElement, Module } from '@ijstech/components';
    import { ISubscriptionDiscountRule } from '@scom/scom-social-sdk';
    type onSubscribedCallback = (subscription: ISubscriptionDiscountRule) => void;
    interface SubscriptionBundleElement extends ControlElement {
        data?: ISubscriptionBundle;
        onSubscribeBundle?: onSubscribedCallback;
    }
    interface ISubscriptionBundle extends ISubscriptionDiscountRule {
        basePrice: number;
        tokenSymbol?: string;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-subscription-bundle']: SubscriptionBundleElement;
            }
        }
    }
    export class SubscriptionBundle extends Module {
        private pnlSubscribeButton;
        private lblName;
        private lblDiscountPercentage;
        private lblOfferPrice;
        private pnlValidityPeriod;
        private lblValidityPeriod;
        private _data;
        onSubscribeBundle: onSubscribedCallback;
        init(): void;
        setData(data: ISubscriptionBundle): void;
        private handleSubscribeBundle;
        render(): any;
    }
}
/// <amd-module name="@scom/scom-subscription-affiliate/components/subscriptionModule.tsx" />
declare module "@scom/scom-subscription-affiliate/components/subscriptionModule.tsx" {
    import { ControlElement, Module } from '@ijstech/components';
    import { ISubscription } from "@scom/scom-subscription-affiliate/interface.ts";
    type onSubscribedCallback = () => void;
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-subscription-module']: SubscriptionModuleElement;
            }
        }
    }
    interface SubscriptionModuleElement extends ControlElement {
        onSubscribed?: onSubscribedCallback;
    }
    export class SubscriptionModule extends Module {
        private lblOfferPrice;
        private pnlOffer;
        private bundleWrapper;
        private iconCollapse;
        private pnlSubscriptionBundles;
        private _data;
        private nftMinter;
        onSubscribed: onSubscribedCallback;
        setData(data: ISubscription): void;
        checkUserSubscription(chainId: number, nftAddress: string): Promise<{
            isSubscribed: boolean;
            startTime?: number;
            endTime?: number;
        }>;
        private updateUI;
        private handleSubscribeButtonClick;
        _checkUserSubscription(): Promise<void>;
        private openNFTMinter;
        init(): void;
        private onSubscribeBundle;
        private onCollapse;
        private renderSubscriptionBundles;
        render(): any;
    }
}
/// <amd-module name="@scom/scom-subscription-affiliate/components/index.ts" />
declare module "@scom/scom-subscription-affiliate/components/index.ts" {
    export { SubscriptionBundle } from "@scom/scom-subscription-affiliate/components/subscriptionBundle.tsx";
    export { SubscriptionModule } from "@scom/scom-subscription-affiliate/components/subscriptionModule.tsx";
}
/// <amd-module name="@scom/scom-subscription-affiliate" />
declare module "@scom/scom-subscription-affiliate" {
    import { Module, ControlElement } from '@ijstech/components';
    import { SocialDataManager } from '@scom/scom-social-sdk';
    interface ScomSubscriptionAffiliateElement extends ControlElement {
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-subscription-affiliate']: ScomSubscriptionAffiliateElement;
            }
        }
    }
    export default class ScomSubscriptionAffiliate extends Module {
        private imgBanner;
        private pnlAvatar;
        private imgAvatar;
        private lblName;
        private lblDescription;
        private subscriptionModule;
        private _data;
        private _dataManager;
        private communityInfo;
        checkUserSubscription: (chainId: number, nftAddress: string) => Promise<{
            isSubscribed: boolean;
            startTime?: number;
            endTime?: number;
        }>;
        get dataManager(): SocialDataManager;
        set dataManager(manager: SocialDataManager);
        init(): void;
        handleCheckUserSubscription(chainId: number, nftAddress: string): Promise<{
            isSubscribed: boolean;
            startTime?: number;
            endTime?: number;
        }>;
        private setData;
        private getData;
        private getTag;
        private updateTag;
        private setTag;
        private updateStyle;
        private updateTheme;
        private clear;
        private getCommunityUrl;
        private updateUI;
        private getActions;
        getConfigurators(): {
            name: string;
            target: string;
            getActions: (category?: string) => {
                name: string;
                userInputDataSchema: {
                    type: string;
                    properties: {
                        communityUri: {
                            title: string;
                            type: string;
                            placeholder: string;
                            required: boolean;
                        };
                        walletAddress: {
                            title: string;
                            type: string;
                            format: string;
                        };
                    };
                };
                userInputUISchema: {
                    type: string;
                    elements: {
                        type: string;
                        scope: string;
                    }[];
                };
            }[];
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
        }[];
        render(): void;
    }
}
