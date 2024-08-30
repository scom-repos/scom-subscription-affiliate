var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-subscription-affiliate/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-subscription-affiliate/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.preWrapStyle = exports.noWrapStyle = exports.imageStyle = void 0;
    exports.imageStyle = components_1.Styles.style({
        transform: 'translateY(-40%)',
        $nest: {
            '&>img': {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
            }
        }
    });
    exports.noWrapStyle = components_1.Styles.style({
        whiteSpace: 'nowrap'
    });
    exports.preWrapStyle = components_1.Styles.style({
        whiteSpace: 'pre-wrap'
    });
});
define("@scom/scom-subscription-affiliate/utils/index.ts", ["require", "exports", "@scom/scom-social-sdk"], function (require, exports, scom_social_sdk_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNFTRecipientWalletAddress = exports.checkIsLoggedIn = exports.getCommunityBasicInfoFromUri = exports.fetchCommunityInfo = void 0;
    async function fetchCommunityInfo(dataManager, communityId, creatorId) {
        const info = await dataManager.fetchCommunityInfo(creatorId, communityId);
        return info;
    }
    exports.fetchCommunityInfo = fetchCommunityInfo;
    function getCommunityBasicInfoFromUri(communityUri) {
        const info = scom_social_sdk_1.SocialUtilsManager.getCommunityBasicInfoFromUri(communityUri);
        info.creatorId = scom_social_sdk_1.Nip19.npubEncode(info.creatorId);
        return info;
    }
    exports.getCommunityBasicInfoFromUri = getCommunityBasicInfoFromUri;
    function checkIsLoggedIn() {
        const isLoggedIn = !!localStorage.getItem('loggedInAccount') &&
            !!localStorage.getItem('privateKey');
        return isLoggedIn;
    }
    exports.checkIsLoggedIn = checkIsLoggedIn;
    function getNFTRecipientWalletAddress() {
        let walletAddress;
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
    exports.getNFTRecipientWalletAddress = getNFTRecipientWalletAddress;
});
define("@scom/scom-subscription-affiliate/formSchema.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-subscription-affiliate/formSchema.ts'/> 
    exports.default = {
        dataSchema: {
            type: "object",
            properties: {
                community: {
                    type: "string",
                    placeholder: "Community Id/Creator's npub",
                    required: true
                },
                walletAddress: {
                    title: "Wallet Address",
                    type: "string",
                    format: "wallet-address"
                }
            }
        },
        uiSchema: {
            type: "VerticalLayout",
            elements: [
                {
                    type: "Control",
                    scope: "#/properties/community"
                },
                {
                    type: "Control",
                    scope: "#/properties/walletAddress"
                }
            ]
        }
    };
});
define("@scom/scom-subscription-affiliate/components/subscriptionBundle.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-subscription-affiliate/index.css.ts"], function (require, exports, components_2, index_css_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SubscriptionBundle = void 0;
    const Theme = components_2.Styles.Theme.ThemeVars;
    let SubscriptionBundle = class SubscriptionBundle extends components_2.Module {
        init() {
            super.init();
            const data = this.getAttribute('data', true);
            if (data)
                this.setData(data);
        }
        setData(data) {
            this._data = data;
            const { name, fixedPrice, discountPercentage, discountType, minDuration, startTime, endTime, basePrice, tokenSymbol } = this._data;
            const isUpcoming = startTime && (0, components_2.moment)().isBefore((0, components_2.moment)(startTime * 1000));
            const isEnded = endTime && (0, components_2.moment)().isAfter((0, components_2.moment)(endTime * 1000));
            let price = basePrice * (minDuration || 1);
            if (discountPercentage > 0 || fixedPrice > 0) {
                if (discountType === 'Percentage') {
                    const discountedPrice = basePrice * (1 - discountPercentage / 100);
                    price = discountedPrice * (minDuration || 1);
                }
                else {
                    price = fixedPrice;
                }
            }
            this.pnlSubscribeButton.cursor = isUpcoming || isEnded ? 'default' : 'pointer';
            this.pnlSubscribeButton.opacity = isUpcoming || isEnded ? 0.6 : 1;
            this.lblName.caption = name;
            this.lblDiscountPercentage.caption = `(${discountPercentage || 0}% off)`;
            this.lblDiscountPercentage.visible = discountType === 'Percentage' && discountPercentage > 0;
            this.lblOfferPrice.caption = `${components_2.FormatUtils.formatNumber(price, { shortScale: price >= 10000, decimalFigures: 6, roundingMethod: 'floor', hasTrailingZero: false })} ${tokenSymbol || ''}`;
            this.pnlValidityPeriod.visible = startTime > 0 && endTime > 0;
            this.lblValidityPeriod.caption = `${(0, components_2.moment)(startTime * 1000).format('MMM DD, YYYY')} - ${(0, components_2.moment)(endTime * 1000).format('MMM DD, YYYY')}`;
        }
        handleSubscribeBundle() {
            if (this.onSubscribeBundle)
                this.onSubscribeBundle(this._data);
        }
        render() {
            return (this.$render("i-stack", { direction: "vertical", width: "100%" },
                this.$render("i-stack", { id: "pnlSubscribeButton", gap: "0.5rem", direction: "horizontal", alignItems: "center", justifyContent: "space-between", minHeight: 36, width: "100%", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, border: { radius: 18 }, background: { color: Theme.colors.primary.main }, stack: { grow: '1', shrink: '1', basis: '0' }, onClick: this.handleSubscribeBundle },
                    this.$render("i-stack", { direction: "horizontal", alignItems: "center", wrap: "wrap" },
                        this.$render("i-label", { id: "lblName", class: "text-center", font: { size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText } }),
                        this.$render("i-label", { id: "lblDiscountPercentage", visible: false, class: "text-center", margin: { left: 4 }, font: { size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText } })),
                    this.$render("i-label", { id: "lblOfferPrice", class: `${index_css_1.noWrapStyle} text-center`, font: { size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText } })),
                this.$render("i-stack", { id: "pnlValidityPeriod", direction: "horizontal", gap: "0.5rem", alignItems: "center", justifyContent: "space-between", padding: { top: '0.25rem' }, lineHeight: 1.5, visible: false },
                    this.$render("i-label", { caption: "Active:", font: { size: '0.875rem', color: Theme.text.secondary } }),
                    this.$render("i-label", { id: "lblValidityPeriod", font: { size: '0.875rem', color: Theme.text.secondary }, margin: { left: 'auto' } }))));
        }
    };
    SubscriptionBundle = __decorate([
        (0, components_2.customElements)('i-scom-subscription-bundle')
    ], SubscriptionBundle);
    exports.SubscriptionBundle = SubscriptionBundle;
});
define("@scom/scom-subscription-affiliate/components/subscriptionModule.tsx", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-token-list", "@scom/scom-nft-minter", "@scom/scom-subscription-affiliate/components/subscriptionBundle.tsx", "@scom/scom-subscription-affiliate/utils/index.ts"], function (require, exports, components_3, eth_wallet_1, scom_token_list_1, scom_nft_minter_1, subscriptionBundle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SubscriptionModule = void 0;
    const Theme = components_3.Styles.Theme.ThemeVars;
    let SubscriptionModule = class SubscriptionModule extends components_3.Module {
        setData(data) {
            this._data = data;
            this.updateUI();
        }
        updateUI() {
            this.bundleWrapper.visible = false;
            this.pnlSubscriptionBundles.clearInnerHTML();
            if (this._data.isSubscribed) {
                this.lblValidUtil.caption = "Valid Until " + (0, components_3.moment)(this._data.endTime * 1000).format('MMM DD YYYY');
                this.lblValidUtil.visible = true;
                this.lblActiveOn.visible = false;
                this.pnlOffer.visible = false;
            }
            else {
                this.lblValidUtil.visible = false;
                if (this._data.startTime) {
                    this.lblActiveOn.caption = "Active on " + (0, components_3.moment)(this._data.startTime * 1000).format('MMM DD YYYY');
                }
                this.lblActiveOn.visible = this._data.startTime > 0;
                this.pnlOffer.visible = true;
                const dayText = this._data.durationInDays > 1 ? `for ${this._data.durationInDays} days` : 'per day';
                const address = this._data.currency === eth_wallet_1.Utils.nullAddress ? undefined : this._data.currency;
                let token = scom_token_list_1.tokenStore.getTokenList(this._data.chainId).find(v => v.address === address);
                this.lblOfferPrice.caption = `${this._data.price} ${token?.symbol || ""} ${dayText}`;
                this.renderSubscriptionBundles(token?.symbol || '');
            }
        }
        handleSubscribeButtonClick() {
            if (!this._data.isSubscribed)
                this.openNFTMinter();
        }
        async checkUserSubscription() {
            // const subscriptionInfo = await checkUserSubscription(this._data.chainId, this._data.tokenAddress);
            // this._data.isSubscribed = subscriptionInfo.isSubscribed;
            // this._data.startTime = subscriptionInfo.startTime;
            // this._data.endTime = subscriptionInfo.endTime;
            this.updateUI();
        }
        async openNFTMinter(discountRuleId) {
            if (!this.nftMinter) {
                this.nftMinter = new scom_nft_minter_1.default();
                this.nftMinter.display = 'block';
                this.nftMinter.margin = { top: '1rem' };
            }
            this.nftMinter.onMintedNFT = async () => {
                this.nftMinter.closeModal();
                // this.checkUserSubscription();
                if (this.onSubscribed)
                    this.onSubscribed();
            };
            this.nftMinter.openModal({
                title: 'Mint NFT to unlock content',
                width: '38rem',
                zIndex: 200,
                popupPlacement: 'top',
                padding: { top: "1rem", bottom: "1rem", left: "1.5rem", right: "1.5rem" },
                closeOnBackdropClick: false,
            });
            await this.nftMinter.ready();
            const walletAddress = await (0, utils_1.getNFTRecipientWalletAddress)();
            const builder = this.nftMinter.getConfigurators('customNft').find((conf) => conf.target === 'Builders');
            builder.setData({
                productType: 'Subscription',
                nftType: this._data.tokenType,
                chainId: this._data.chainId,
                nftAddress: this._data.tokenAddress,
                erc1155Index: this._data.tokenId,
                recipient: walletAddress,
                discountRuleId: discountRuleId
            });
        }
        init() {
            super.init();
            this.openNFTMinter = this.openNFTMinter.bind(this);
            this.onSubscribeBundle = this.onSubscribeBundle.bind(this);
        }
        onSubscribeBundle(subscription) {
            if (!this._data.isSubscribed)
                this.openNFTMinter(subscription.id);
        }
        onCollapse() {
            this.pnlSubscriptionBundles.visible = !this.pnlSubscriptionBundles.visible;
            this.iconCollapse.name = this.pnlSubscriptionBundles.visible ? 'angle-up' : 'angle-down';
        }
        renderSubscriptionBundles(symbol) {
            const now = Math.round(Date.now() / 1000);
            const filteredRules = this._data?.discountRules?.filter(rule => {
                return (!rule.startTime && !rule.endTime) || (now >= rule.startTime && now <= rule.endTime);
            }) || [];
            if (!filteredRules?.length)
                return;
            this.pnlSubscriptionBundles.clearInnerHTML();
            for (const subscription of filteredRules) {
                const bundle = new subscriptionBundle_1.SubscriptionBundle(undefined, {
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
            return (this.$render("i-stack", { direction: "vertical", border: { top: { width: 1, style: 'solid', color: Theme.divider } }, wrap: "wrap" },
                this.$render("i-label", { width: "100%", padding: { top: '0.75rem', bottom: '0.75rem', left: '0.75rem', right: '0.75rem' }, font: { size: '1rem', weight: 600, color: Theme.text.secondary, transform: 'uppercase' }, lineHeight: 1.5, caption: "Subscription" }),
                this.$render("i-stack", { direction: "vertical", padding: { bottom: '0.75rem' } },
                    this.$render("i-panel", { id: "pnlOffer", maxWidth: "100%", stack: { grow: '1', shrink: '1', basis: '0' }, visible: false },
                        this.$render("i-panel", { padding: { left: '0.75rem', right: '0.75rem' } },
                            this.$render("i-stack", { gap: "1rem", direction: "horizontal", alignItems: "center", justifyContent: "space-between", minHeight: 36, width: "100%", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }, border: { radius: 18 }, background: { color: Theme.colors.primary.main }, stack: { grow: '1', shrink: '1', basis: '0' }, cursor: "pointer", onClick: this.handleSubscribeButtonClick },
                                this.$render("i-label", { class: "text-center", font: { size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText, transform: 'uppercase' }, lineHeight: 1.5, caption: "Subscribe" }),
                                this.$render("i-label", { id: "lblOfferPrice", class: "text-center", font: { size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText }, lineHeight: 1.5 })),
                            this.$render("i-label", { id: "lblActiveOn", width: "100%", padding: { top: '0.75rem' }, font: { size: '0.875rem', color: Theme.text.secondary }, lineHeight: 1.5, overflowWrap: "break-word", visible: false })),
                        this.$render("i-stack", { id: "bundleWrapper", visible: false, gap: "0.5rem", direction: "vertical", alignItems: "center", justifyContent: "space-between", width: "100%", margin: { top: '1rem' }, border: { top: { width: 1, style: 'solid', color: Theme.divider } } },
                            this.$render("i-stack", { gap: "1rem", direction: "horizontal", alignItems: "center", justifyContent: "space-between", width: "100%", padding: { top: '0.75rem', bottom: '0.75rem', left: '0.75rem', right: '0.75rem' }, cursor: "pointer", hover: { backgroundColor: Theme.action.hoverBackground }, onClick: this.onCollapse },
                                this.$render("i-label", { caption: "Subscription Bundles", font: { size: '1rem', weight: 600, color: Theme.text.secondary, transform: 'uppercase' } }),
                                this.$render("i-icon", { id: "iconCollapse", name: "angle-up", width: 20, height: 20, fill: Theme.text.secondary })),
                            this.$render("i-stack", { id: "pnlSubscriptionBundles", gap: "1rem", width: "100%", direction: "vertical", alignItems: "center", padding: { left: '0.75rem', right: '0.75rem' } }))),
                    this.$render("i-label", { id: "lblValidUtil", width: "100%", padding: { left: '0.75rem', right: '0.75rem' }, font: { size: '0.875rem', color: Theme.text.secondary }, lineHeight: 1.5, overflowWrap: "break-word", visible: false }))));
        }
    };
    SubscriptionModule = __decorate([
        (0, components_3.customElements)('i-scom-subscription-module')
    ], SubscriptionModule);
    exports.SubscriptionModule = SubscriptionModule;
});
define("@scom/scom-subscription-affiliate/components/index.ts", ["require", "exports", "@scom/scom-subscription-affiliate/components/subscriptionBundle.tsx", "@scom/scom-subscription-affiliate/components/subscriptionModule.tsx"], function (require, exports, subscriptionBundle_2, subscriptionModule_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SubscriptionModule = exports.SubscriptionBundle = void 0;
    Object.defineProperty(exports, "SubscriptionBundle", { enumerable: true, get: function () { return subscriptionBundle_2.SubscriptionBundle; } });
    Object.defineProperty(exports, "SubscriptionModule", { enumerable: true, get: function () { return subscriptionModule_1.SubscriptionModule; } });
});
define("@scom/scom-subscription-affiliate", ["require", "exports", "@ijstech/components", "@scom/scom-subscription-affiliate/index.css.ts", "@scom/scom-subscription-affiliate/utils/index.ts", "@scom/scom-social-sdk", "@scom/scom-subscription-affiliate/formSchema.ts"], function (require, exports, components_4, index_css_2, utils_2, scom_social_sdk_2, formSchema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_4.Styles.Theme.ThemeVars;
    let ScomSubscriptionAffiliate = class ScomSubscriptionAffiliate extends components_4.Module {
        get dataManager() {
            return this._dataManager;
        }
        set dataManager(manager) {
            this._dataManager = manager;
        }
        init() {
            super.init();
        }
        async setData(data) {
            this._data = data;
            this.clear();
            if (this._data.communityUri) {
                const parts = this._data.communityUri.split('/');
                this._data.communityId = parts[0];
                this._data.creatorId = parts[1];
            }
            this.communityInfo = await (0, utils_2.fetchCommunityInfo)(this.dataManager, this._data.communityId, this._data.creatorId);
            if (this.communityInfo)
                this.updateUI();
        }
        getData() {
            return this._data;
        }
        getTag() {
            return this.tag;
        }
        updateTag(type, value) {
            this.tag[type] = this.tag[type] ?? {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.tag[type][prop] = value[prop];
            }
        }
        async setTag(value) {
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
        updateStyle(name, value) {
            value ?
                this.style.setProperty(name, value) :
                this.style.removeProperty(name);
        }
        updateTheme() {
            const themeVar = document.body.style.getPropertyValue('--theme') || 'dark';
            this.updateStyle('--text-primary', this.tag[themeVar]?.fontColor);
            this.updateStyle('--background-main', this.tag[themeVar]?.backgroundColor);
            this.updateStyle('--input-font_color', this.tag[themeVar]?.inputFontColor);
            this.updateStyle('--input-background', this.tag[themeVar]?.inputBackgroundColor);
            this.updateStyle('--colors-primary-main', this.tag[themeVar]?.buttonBackgroundColor);
        }
        clear() {
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
        }
        updateUI() {
            this.imgBanner.url = this.communityInfo.bannerImgUrl;
            this.imgAvatar.url = this.communityInfo.avatarImgUrl;
            this.pnlAvatar.visible = !!this.communityInfo.avatarImgUrl;
            this.lblName.caption = this.communityInfo.communityId;
            this.lblDescription.caption = this.communityInfo.description;
            this.lblPubkey.caption = components_4.FormatUtils.truncateWalletAddress(this.communityInfo.creatorId);
            const isExclusive = this.communityInfo.membershipType === scom_social_sdk_2.MembershipType.Protected;
            this.lblCommunityType.visible = isExclusive;
            if (this.communityInfo.parentCommunityUri) {
                const { communityId } = (0, utils_2.getCommunityBasicInfoFromUri)(this.communityInfo.parentCommunityUri);
                this.pnlParentCommunity.visible = true;
                this.lblParentCommunity.caption = communityId;
            }
            const subscriptions = this.communityInfo.policies?.filter(policy => policy.paymentModel === scom_social_sdk_2.PaymentModel.Subscription);
            if (subscriptions.length > 0) {
                const subscription = subscriptions[0];
                const isLoggedIn = (0, utils_2.checkIsLoggedIn)();
                let isSubscribed = false;
                // if (isLoggedIn) {
                //     const data = await checkUserSubscription(subscription.chainId, subscription.tokenAddress);
                //     isSubscribed = data.isSubscribed;
                // }
                if (isSubscribed) {
                    this.subscriptionModule.visible = false;
                }
                else {
                    this.subscriptionModule.setData({
                        chainId: subscription.chainId,
                        tokenAddress: subscription.tokenAddress,
                        tokenType: subscription.tokenType,
                        tokenId: subscription.tokenId,
                        price: subscription.tokenAmount,
                        currency: subscription.currency,
                        durationInDays: subscription.durationInDays,
                        discountRules: subscription.discountRules
                    });
                    this.subscriptionModule.visible = true;
                }
            }
            else {
                this.subscriptionModule.visible = false;
            }
        }
        getActions() {
            return [
                {
                    name: 'Settings',
                    userInputDataSchema: formSchema_1.default.dataSchema,
                    userInputUISchema: formSchema_1.default.uiSchema,
                }
            ];
        }
        getConfigurators() {
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: (category) => {
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
                    getActions: (category) => {
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
        async onCopyPubkey() {
            try {
                await components_4.application.copyToClipboard(this.communityInfo.creatorId);
                this.imgCopy.name = "check";
                this.imgCopy.fill = Theme.colors.success.main;
                if (this.copyTimer)
                    clearTimeout(this.copyTimer);
                this.copyTimer = setTimeout(() => {
                    this.imgCopy.name = "copy";
                    this.imgCopy.fill = Theme.text.primary;
                }, 500);
            }
            catch { }
        }
        viewParentCommunity() {
            if (!this.communityInfo?.parentCommunityUri)
                return;
            const { creatorId, communityId } = (0, utils_2.getCommunityBasicInfoFromUri)(this.communityInfo.parentCommunityUri);
            const ensMap = {};
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
            this.$render("i-panel", { background: { color: Theme.background.paper } },
                this.$render("i-panel", { position: "relative", width: "100%", height: 0, overflow: "hidden", padding: { bottom: "40%" } },
                    this.$render("i-image", { id: "imgBanner", class: index_css_2.imageStyle, position: "absolute", display: "block", width: "100%", height: "auto", top: "40%", left: 0, objectFit: "cover" })),
                this.$render("i-stack", { direction: "vertical", position: "relative", padding: { top: '1.5rem', bottom: '1.25rem', left: '1rem', right: '1rem' } },
                    this.$render("i-panel", { height: "0.75rem", width: "100%", position: "absolute", top: 0, left: 0, background: { color: `color-mix(in srgb, ${Theme.background.paper}, #fff 5%)` } }),
                    this.$render("i-panel", { id: "pnlAvatar", padding: { bottom: "4rem" }, visible: false },
                        this.$render("i-panel", { border: {
                                radius: '50%',
                                width: '0.25rem',
                                style: 'solid',
                                color: Theme.background.paper,
                            }, background: { color: Theme.background.paper }, overflow: 'hidden', width: '8.875rem', height: '8.875rem', position: 'absolute', top: '-5.5rem' },
                            this.$render("i-image", { id: 'imgAvatar', display: "block", width: "100%", height: "100%", objectFit: 'cover', border: { radius: '50%' }, background: { color: Theme.background.paper } }))),
                    this.$render("i-stack", { alignItems: 'center', justifyContent: "space-between", margin: { bottom: "0.5rem" } },
                        this.$render("i-label", { id: "lblName", font: { size: '1.75rem', weight: 700 }, lineHeight: "2.125rem" })),
                    this.$render("i-stack", { direction: "horizontal", alignItems: 'center', margin: { bottom: '0.5rem' }, gap: '0.5rem', cursor: 'pointer', opacity: 0.4, hover: { opacity: 1 }, onClick: this.onCopyPubkey },
                        this.$render("i-label", { id: 'lblPubkey', font: {
                                size: '0.875rem',
                                weight: 400,
                                color: Theme.text.primary,
                            }, lineHeight: '1rem' }),
                        this.$render("i-icon", { id: 'imgCopy', name: 'copy', width: '1rem', height: '1rem', display: 'inline-flex' })),
                    this.$render("i-stack", { id: "pnlParentCommunity", direction: "horizontal", width: "fit-content", alignItems: "center", margin: { bottom: '0.5rem' }, gap: "0.5rem", cursor: "pointer", onClick: this.viewParentCommunity, visible: false },
                        this.$render("i-icon", { width: "0.9375rem", height: "0.9375rem", name: "user-friends" }),
                        this.$render("i-label", { id: "lblParentCommunity", font: { size: '0.9375rem' } })),
                    this.$render("i-stack", { direction: "horizontal", justifyContent: "space-between" },
                        this.$render("i-label", { id: "lblDescription", class: index_css_2.preWrapStyle, font: { size: '0.9375rem' }, lineHeight: "1.25rem", lineClamp: 5, margin: { top: "0.25rem", bottom: "1rem" } })),
                    this.$render("i-label", { id: "lblCommunityType", width: "fit-content", padding: { top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }, border: { width: '1px', style: 'solid', color: Theme.colors.primary.main, radius: '0.375rem' }, font: { size: '0.9375rem', color: Theme.colors.primary.main }, caption: "Exclusive Community", visible: false })),
                this.$render("i-scom-subscription-module", { id: "subscriptionModule", width: "100%", margin: { top: '0.5rem', bottom: '0.75rem' }, visible: false }));
        }
    };
    ScomSubscriptionAffiliate = __decorate([
        (0, components_4.customElements)('i-scom-subscription-affiliate')
    ], ScomSubscriptionAffiliate);
    exports.default = ScomSubscriptionAffiliate;
});
