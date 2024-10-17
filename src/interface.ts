import { IProtectedMembershipPolicy, ISubscriptionDiscountRule, TokenType } from "@scom/scom-social-sdk";

export interface ISubscriptionAffiliate {
    communityUri?: string;
    creatorId?: string;
    communityId?: string;
    walletAddress?: string;
}

export interface ISubscription {
	creatorId: string;
	communityId: string;
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

export interface ICommissionInfo {
    chainId: number;
    walletAddress: string;
    share: string;
}

export interface ICheckUserSubscription {
    isSubscribed: boolean;
    startTime?: number;
    endTime?: number;
}