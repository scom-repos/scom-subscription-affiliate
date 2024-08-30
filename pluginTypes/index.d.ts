/// <reference path="@scom/scom-social-sdk/index.d.ts" />
/// <amd-module name="@scom/scom-subscription-affiliate/interface.ts" />
declare module "@scom/scom-subscription-affiliate/interface.ts" {
    import { TokenType } from "@scom/scom-social-sdk";
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
        isSubscribed?: boolean;
        startTime?: number;
        endTime?: number;
        discountRules?: ISubscriptionDiscountRule[];
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
    export function getNFTRecipientWalletAddress(): string;
}
/// <amd-module name="@scom/scom-subscription-affiliate/formSchema.ts" />
declare module "@scom/scom-subscription-affiliate/formSchema.ts" {
    const _default: {
        dataSchema: {
            type: string;
            properties: {
                community: {
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
/// <amd-module name="@scom/scom-subscription-affiliate" />
declare module "@scom/scom-subscription-affiliate" {
    import { Module, ControlElement } from '@ijstech/components';
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
        private lblPubkey;
        private imgCopy;
        private pnlParentCommunity;
        private lblParentCommunity;
        private lblDescription;
        private lblCommunityType;
        private _data;
        private communityInfo;
        private copyTimer;
        init(): void;
        private setData;
        private getData;
        private getTag;
        private updateTag;
        private setTag;
        private updateStyle;
        private updateTheme;
        private getActions;
        getConfigurators(): {
            name: string;
            target: string;
            getActions: (category?: string) => {
                name: string;
                userInputDataSchema: {
                    type: string;
                    properties: {
                        community: {
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
        private onCopyPubkey;
        private viewParentCommunity;
        render(): void;
    }
}
