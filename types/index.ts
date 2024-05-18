export interface Link {
    urlFrom: string;
    anchor: string;
    completeUrl: string;
}

export interface Opportunity {
    urlFrom: string;
    anchorContext: string;
    completeUrl: string;
}

export interface WebflowItem {
    id: string;
    cmsLocaleId: string;
    lastPublished: string;
    lastUpdated: string;
    createdOn: string;
    isArchived: boolean;
    isDraft: boolean;
    fieldData: {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        [key: string]: any;
    };
}

export interface WebflowResponse {
    items: WebflowItem[];
}
