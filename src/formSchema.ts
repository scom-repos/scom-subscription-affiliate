export default {
    dataSchema: {
        type: "object",
        properties: {
            communityUri: {
                title: 'Community',
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
                scope: "#/properties/communityUri"
            },
            {
                type: "Control",
                scope: "#/properties/walletAddress"
            }
        ]
    }
}