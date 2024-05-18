export interface WebflowItem {
    id: string;
    cmsLocaleId: string;
    createdOn: string;
    fieldData: {
        'post-body': string;
        slug: string;
        [key: string]: any; // Outros campos podem ser adicionados aqui
    };
    [key: string]: any; // Outros campos podem ser adicionados aqui
}

export interface WebflowData {
    items: WebflowItem[];
}

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
