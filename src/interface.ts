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
    commissions?: ICommissionInfo[];
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