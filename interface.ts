export interface ILpu {
    titleName : string,
    name      : string,
    connect   ?: {
        hostName  : string,
        port      ?: number | 22 | 2222
        userName  : string | 'root'
        password  : string | 'shedF34A'
    }
    rootPath ?: {
        amb     ?: string | '/var/www/html/web_amb_doctor',
        stac    ?: string | '/var/www/html/web'
        ambStac ?: string | '/var/www/html/web'
    },
    errLoggerRelativePath ?: string | 'doctorroom/logs/error.txt',
    yamlRelativePath      ?: string | 'doctorroom/config/config.yaml',
    childElements         ?: Array<ILpu>
    readonly              ?: boolean
}

export interface IQueryGetFile {
    id       : string;
    fileType ?: "yaml" | "error";
    lpuType  : 'Стационар' | 'Амбулатория' | 'Амбулатория + Стационар'
}

export interface IQuerySetFile {
    id       : string;
    fileType ?: "yaml" | "error";
    lpuType  : 'Стационар' | 'Амбулатория' | 'Амбулатория + Стационар',
    node     ?: string
}

export interface ILpuForFrontend {
    titleName         : string,
    name              : string,
    availableLpuTypes : Array<string>,
    childElements     ?: Array<ILpuChildForFrontend>
    readonly          : boolean
}

export interface ILpuChildForFrontend {
    name          : string,
    titleName     : string,
    childElements ?: Array<ILpuForFrontend>
}