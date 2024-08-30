import {
    Module,
    customModule,
} from '@ijstech/components';
import ScomSubscriptionAffiliate from '@scom/scom-subscription-affiliate';

@customModule
export default class Module1 extends Module {
    private affiliate: ScomSubscriptionAffiliate;

    init() {
        super.init();
        this.setData();
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
            <i-stack
                direction="vertical"
                margin={{ top: '1rem', left: '1rem', right: '1rem' }}
                gap="1rem"
            >
                <i-scom-subscription-affiliate id="affiliate"></i-scom-subscription-affiliate>
            </i-stack>
        )
    }
}