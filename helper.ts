import {lpuList} from "./static/config";

export function getLpuById(id: string) {
    let separatedId = id.split('-');
    let selectedLpu = lpuList.find(lpu => {
        if(separatedId[1]) {
            if(lpu.name === separatedId[0])
                if(lpu.childElements)
                    return lpu.childElements.find(childItem => childItem.name === separatedId[1])
        } else {
            return lpu.name === id
        }
    })

    if(selectedLpu && selectedLpu.childElements && separatedId[1]) {
        selectedLpu.childElements = selectedLpu.childElements.filter(lpu => lpu.name === separatedId[1])
    }

    return selectedLpu;
}

export function getLpuTypeTitleNameByAliasName(aliasName: string): string {
    switch (aliasName) {
        case 'amb':
            return 'Амбулатория';
        case 'stac':
            return 'Стационар';
        case 'ambStac':
            return 'Амбулатория + Стационар';
        default:
            return aliasName;
    }
}

export function decryptCyrillicLpuType(lpuTypeInCyrillic: string): 'amb' | 'stac' | 'ambStac' {
    switch (lpuTypeInCyrillic) {
        case 'Амбулатория':
            return 'amb';
        case 'Стационар':
            return 'stac';
        case 'Амбулатория + Стационар':
            return 'ambStac';
        default:
            return 'amb';
    }
}