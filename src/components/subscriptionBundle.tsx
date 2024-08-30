import {
    ControlElement,
    customElements,
    FormatUtils,
    Icon,
    Label,
    Module,
    moment,
    Panel,
    StackLayout,
    Styles,
} from '@ijstech/components';
import { ISubscriptionDiscountRule } from '@scom/scom-social-sdk';
import { noWrapStyle } from '../index.css';

const Theme = Styles.Theme.ThemeVars;

type onSubscribedCallback = (subscription: ISubscriptionDiscountRule) => void;

interface SubscriptionBundleElement extends ControlElement {
    data?: ISubscriptionBundle;
    onSubscribeBundle?: onSubscribedCallback;
}

interface ISubscriptionBundle extends ISubscriptionDiscountRule {
    basePrice: number;
    tokenSymbol?: string;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-subscription-bundle']: SubscriptionBundleElement;
        }
    }
}

@customElements('i-scom-subscription-bundle')
export class SubscriptionBundle extends Module {
    private pnlSubscribeButton: StackLayout;
    private lblName: Label;
    private lblDiscountPercentage: Label;
    private lblOfferPrice: Label;
    private pnlValidityPeriod: StackLayout;
    private lblValidityPeriod: Label;
    private _data: ISubscriptionBundle;
    public onSubscribeBundle: onSubscribedCallback;

    init() {
        super.init();
        const data = this.getAttribute('data', true);
        if (data) this.setData(data);
    }

    setData(data: ISubscriptionBundle) {
        this._data = data;
        const { name, fixedPrice, discountPercentage, discountType, minDuration, startTime, endTime, basePrice, tokenSymbol } = this._data;
        const isUpcoming = startTime && moment().isBefore(moment(startTime * 1000));
        const isEnded = endTime && moment().isAfter(moment(endTime * 1000));
        let price = basePrice * (minDuration || 1);
        if (discountPercentage > 0 || fixedPrice > 0) {
            if (discountType === 'Percentage') {
                const discountedPrice = basePrice * (1 - discountPercentage / 100);
                price = discountedPrice * (minDuration || 1);
            } else {
                price = fixedPrice;
            }
        }
        this.pnlSubscribeButton.cursor = isUpcoming || isEnded ? 'default' : 'pointer';
        this.pnlSubscribeButton.opacity = isUpcoming || isEnded ? 0.6 : 1;
        this.lblName.caption = name;
        this.lblDiscountPercentage.caption = `(${discountPercentage || 0}% off)`;
        this.lblDiscountPercentage.visible = discountType === 'Percentage' && discountPercentage > 0;
        this.lblOfferPrice.caption = `${FormatUtils.formatNumber(price, { shortScale: price >= 10000, decimalFigures: 6, roundingMethod: 'floor', hasTrailingZero: false })} ${tokenSymbol || ''}`;
        this.pnlValidityPeriod.visible = startTime > 0 && endTime > 0;
        this.lblValidityPeriod.caption = `${moment(startTime * 1000).format('MMM DD, YYYY')} - ${moment(endTime * 1000).format('MMM DD, YYYY')}`;
    }

    private handleSubscribeBundle() {
        if (this.onSubscribeBundle) this.onSubscribeBundle(this._data);
    }

    render() {
        return (
            <i-stack direction="vertical" width="100%">
                <i-stack
                    id="pnlSubscribeButton"
                    gap="0.5rem"
                    direction="horizontal"
                    alignItems="center"
                    justifyContent="space-between"
                    minHeight={36}
                    width="100%"
                    padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
                    border={{ radius: 18 }}
                    background={{ color: Theme.colors.primary.main }}
                    stack={{ grow: '1', shrink: '1', basis: '0' }}
                    onClick={this.handleSubscribeBundle}
                >
                    <i-stack direction="horizontal" alignItems="center" wrap="wrap">
                        <i-label
                            id="lblName"
                            class="text-center"
                            font={{ size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText }}
                        />
                        <i-label
                            id="lblDiscountPercentage"
                            visible={false}
                            class="text-center"
                            margin={{ left: 4 }}
                            font={{ size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText }}
                        />
                    </i-stack>
                    <i-label
                        id="lblOfferPrice"
                        class={`${noWrapStyle} text-center`}
                        font={{ size: '0.875rem', weight: 600, color: Theme.colors.primary.contrastText }}
                    />
                </i-stack>
                <i-stack
                    id="pnlValidityPeriod"
                    direction="horizontal"
                    gap="0.5rem"
                    alignItems="center"
                    justifyContent="space-between"
                    padding={{ top: '0.25rem' }}
                    lineHeight={1.5}
                    visible={false}
                >
                    <i-label
                        caption="Active:"
                        font={{ size: '0.875rem', color: Theme.text.secondary }}
                    />
                    <i-label
                        id="lblValidityPeriod"
                        font={{ size: '0.875rem', color: Theme.text.secondary }}
                        margin={{ left: 'auto' }}
                    />
                </i-stack>
            </i-stack>
        )
    }
}