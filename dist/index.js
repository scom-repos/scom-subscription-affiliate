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
    exports.getNFTRecipientWalletAddress = exports.getCommunityBasicInfoFromUri = exports.fetchCommunityInfo = void 0;
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
define("@scom/scom-subscription-affiliate", ["require", "exports", "@ijstech/components", "@scom/scom-subscription-affiliate/index.css.ts", "@scom/scom-subscription-affiliate/utils/index.ts", "@scom/scom-subscription-affiliate/formSchema.ts"], function (require, exports, components_2, index_css_1, utils_1, formSchema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_2.Styles.Theme.ThemeVars;
    let ScomSubscriptionAffiliate = class ScomSubscriptionAffiliate extends components_2.Module {
        init() {
            super.init();
        }
        async setData(data) {
            this._data = data;
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
                await components_2.application.copyToClipboard(this.communityInfo.creatorId);
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
            const { creatorId, communityId } = (0, utils_1.getCommunityBasicInfoFromUri)(this.communityInfo.parentCommunityUri);
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
                    this.$render("i-image", { id: "imgBanner", class: index_css_1.imageStyle, position: "absolute", display: "block", width: "100%", height: "auto", top: "40%", left: 0, objectFit: "cover" })),
                this.$render("i-stack", { direction: "vertical", position: "relative", padding: { top: '1.5rem', bottom: '0.75rem', left: '1rem', right: '1rem' } },
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
                        this.$render("i-label", { id: "lblDescription", class: index_css_1.preWrapStyle, font: { size: '0.9375rem' }, lineHeight: "1.25rem", lineClamp: 5, margin: { top: "0.25rem", bottom: "1rem" } })),
                    this.$render("i-label", { id: "lblCommunityType", width: "fit-content", padding: { top: '0.25rem', bottom: '0.25rem', left: '0.5rem', right: '0.5rem' }, border: { width: '1px', style: 'solid', color: Theme.colors.primary.main, radius: '0.375rem' }, font: { size: '0.9375rem', color: Theme.colors.primary.main }, caption: "Exclusive Community", visible: false })));
        }
    };
    ScomSubscriptionAffiliate = __decorate([
        (0, components_2.customElements)('i-scom-subscription-affiliate')
    ], ScomSubscriptionAffiliate);
    exports.default = ScomSubscriptionAffiliate;
});
