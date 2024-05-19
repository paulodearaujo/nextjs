export interface Link {
    urlFrom: string;
    anchor: string;
    completeUrl: string;
    urlTo: string;
    lastUpdated: string;
}

export interface Opportunity {
    urlFrom: string;
    anchorContext: string;
    completeUrl: string;
    lastUpdated: string;
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
        featured: boolean;
        'date-sort': string;
        hero: boolean;
        'read-time': string;
        'seo-title': string;
        name: string;
        'post-body': string;
        'date-2': string;
        metadescription: string;
        'post-summary-2': string;
        slug: string;
        'category-2': string;
        'post-tags': string[];
        'banner-type': string;
        'image-alt-text': string;
        'thumbnail-image': {
            fileId: string;
            url: string;
            alt: string | null;
        };
    };
    Address: string;
}

export interface WebflowResponse {
    items: WebflowItem[];
}
