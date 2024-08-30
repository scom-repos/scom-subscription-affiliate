import {
    Module,
    customModule,
    Styles,
} from '@ijstech/components';
import { SocialDataManager } from '@scom/scom-social-sdk';
import ScomSubscriptionAffiliate from '@scom/scom-subscription-affiliate';

interface IRelayInfo {
    url: string;
    isPrivate?: boolean;
    userProfileExists?: boolean;
}

interface IInitSocialDataManagerOptions {
    readRelay: string;
    version: 1 | 2;
    writeRelays?: IRelayInfo[];
    mqttBrokerUrl?: string;
    mqttClientOptions?: any;
    mqttSubscriptions?: string[]
}

interface ITheme {
    default: string;
    dark?: Styles.Theme.ITheme;
    light?: Styles.Theme.ITheme;
}

const Theme = Styles.Theme.ThemeVars;

@customModule
export default class Module1 extends Module {
    private affiliate: ScomSubscriptionAffiliate;
    private dataManager: SocialDataManager;

    async init() {
        super.init();
        this.updateThemes(this.options.themes);
        await this.initializeSocialDataManager();
        this.setData();
    }

    mergeTheme = (target: Styles.Theme.ITheme, theme: Styles.Theme.ITheme) => {
        for (const key of Object.keys(theme)) {
            if (theme[key] instanceof Object) {
                Object.assign(theme[key], this.mergeTheme(target[key], theme[key]))
            }
        }
        Object.assign(target || {}, theme)
        return target
    }
    updateThemes(themes?: ITheme) {
        if (!themes) return;
        if (themes.dark) {
            this.mergeTheme(Styles.Theme.darkTheme, themes.dark);
        }
        if (themes.light) {
            this.mergeTheme(Styles.Theme.defaultTheme, themes.light);
        }
        const theme = themes.default === 'light' ? Styles.Theme.defaultTheme : Styles.Theme.darkTheme;
        Styles.Theme.applyTheme(theme);
        document.body.style.setProperty('--theme', themes.default)
    }

    async _initMainSocialDataManager(options: IInitSocialDataManagerOptions) {
        let { readRelay, version, writeRelays } = options;
        const nostrOptions = this.options.nostr;
        if (!writeRelays) writeRelays = nostrOptions.writeRelays;
        if (this.dataManager) {
            await this.dataManager.dispose();
        }
        this.dataManager = new SocialDataManager(
            {
                writeRelays: writeRelays?.map(v => v.url),
                readRelay,
                publicIndexingRelay: nostrOptions.publicIndexingRelay,
                apiBaseUrl: nostrOptions.apiUrl,
                ipLocationServiceBaseUrl: nostrOptions.ipLocationServiceBaseUrl,
                mqttBrokerUrl: options.mqttBrokerUrl,
                mqttClientOptions: options.mqttClientOptions,
                mqttSubscriptions: options.mqttSubscriptions,
                mqttMessageCallback: (topic: string, message: string) => { },
                version: version,
                enableLightningWallet: true
            }
        );
        this.affiliate.dataManager = this.dataManager;
    }

    async initializeSocialDataManager() {
        const nostrOptions = this.options.nostr;
        let options: IInitSocialDataManagerOptions = {
            readRelay: nostrOptions.publicIndexingRelay,
            version: nostrOptions.version,
        }
        await this._initMainSocialDataManager(options);
    }

    setData() {
        const configs = this.affiliate.getConfigurators() || [];
        const configurator = configs.find((conf: any) => conf.target === 'Editor');
        configurator.setData({
            communityUri: 'Polar/npub1n62enfzxxwa952n4v2ctmm7d9t7l6xmuxnh6zcv45c8m6299qq0s7lz0zn'
        });
    }

    render() {
        return (
            <i-panel width="100%" height="100%" background={{ color: Theme.background.main }}>
                <i-stack
                    direction="vertical"
                    maxWidth="38.75rem"
                    padding={{ top: '1rem', bottom: '1rem', left: '1rem', right: '1rem' }}
                    margin={{ left: 'auto', right: 'auto' }}
                    gap="1rem"
                >
                    <i-scom-subscription-affiliate id="affiliate"></i-scom-subscription-affiliate>
                </i-stack>
            </i-panel>
        )
    }
}