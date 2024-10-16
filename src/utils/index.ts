import { ICommunityInfo, Nip19, SocialDataManager, SocialUtilsManager } from "@scom/scom-social-sdk";

export async function fetchCommunityInfo(dataManager: SocialDataManager, communityId: string, creatorId: string) {
    const info: ICommunityInfo = await dataManager.fetchCommunityInfo(creatorId, communityId);
    return info;
}

export function getCommunityBasicInfoFromUri(communityUri: string) {
    const info = SocialUtilsManager.getCommunityBasicInfoFromUri(communityUri);
    info.creatorId = Nip19.npubEncode(info.creatorId);
    return info;
}

export function checkIsLoggedIn() {
    const isLoggedIn = !!localStorage.getItem('loggedInAccount') && 
        !!localStorage.getItem('privateKey');
    return isLoggedIn;
}

export function getUserWalletAddresses() {
    let userWalletAddresses: string[] = [];
    const isLoggedIn = checkIsLoggedIn();
    if (isLoggedIn) {
        const socialWalletAddress = localStorage.getItem('loggedInAccount');
        userWalletAddresses.push(socialWalletAddress);
        const masterWalletAddress = localStorage.getItem('masterWalletAccount');
        if (masterWalletAddress) {
            userWalletAddresses.push(masterWalletAddress);
        }
    }
    return userWalletAddresses;
}

export function getNFTRecipientWalletAddress() {
    let walletAddress: string;
    const isLoggedIn = checkIsLoggedIn();
    if (isLoggedIn) {
        const masterWalletAddress = localStorage.getItem('masterWalletAccount');
        if (masterWalletAddress) {
            walletAddress = masterWalletAddress;
        }
        else {
            const socialWalletAddress = localStorage.getItem('loggedInAccount');
            walletAddress = socialWalletAddress;
        }
    }
    return walletAddress;
}