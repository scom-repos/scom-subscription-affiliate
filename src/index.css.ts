import { Styles } from "@ijstech/components";

export const imageStyle = Styles.style({
    transform: 'translateY(-25%)',
    $nest: {
        '&>img': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
        }
    }
});

export const noWrapStyle = Styles.style({
    whiteSpace: 'nowrap'
});

export const preWrapStyle = Styles.style({
    whiteSpace: 'pre-wrap'
});