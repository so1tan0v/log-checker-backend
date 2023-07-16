export interface ILpu {
    titleName : string,
    name      : string,
    connect   ?: {
        hostName  : string,
        port      ?: number | 22 | 2222
        userName  : string | 'root'
        password  : string | 'shedF34A'
    },
    category?: {
        [key: string]: {
            [key: string]: {
                path     : string,
                clearAll ?: boolean,
                readonly ?: boolean
            }
        }
    },
    childElements ?: Array<ILpu>,
    readonly      ?: boolean,
}

export interface IQueryGetFile {
    id       : string;
    fileType ?: "yaml" | "error" | string;
    lpuType  : 'Стационар' | 'Амбулатория' | 'Амбулатория + Стационар' | string
}

export interface IQuerySetFile {
    id       : string;
    fileType ?: "yaml" | "error";
    lpuType  : 'Стационар' | 'Амбулатория' | 'Амбулатория + Стационар'  | string,
    node     ?: string
}

export interface ILpuForFrontend {
    titleName         : string,
    name              : string,
    category          : IAvailableLpyTypes
    childElements     ?: Array<ILpu>
}

export interface IAvailableLpyTypes {
    [key: string]: {
        [key: string]: {
            path     : string,
            clearAll ?: boolean,
            readonly ?: boolean
        }
    }
}
export interface ILpuChildForFrontend {
    name          : string,
    titleName     : string,
    childElements ?: Array<ILpuForFrontend>
}