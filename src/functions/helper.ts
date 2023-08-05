import {ILpu} from "../interface";
import {lpuList} from "../static/config";
import {isEmpty} from "lodash";


/**
 * Метод производит копирование объекта
 * @param object - объект
 */
export function copyObject(object: object | Array<object>) {
    return JSON.parse(JSON.stringify(object))
}


/**
 * Метод возвращает параметры ЛПУ по его идентификатору
 * @param id - идентификатор ЛПУ
 */
export function getLpuById(id: string) {
    const separatedId = id.split('-');
    const newLpuList: Array<ILpu> = copyObject(lpuList);

    let selectedLpu = newLpuList.find(lpu => {
        if(separatedId[1]) {
            if(lpu.name === separatedId[0])
                if(lpu.childElements)
                    return lpu.childElements.find(childItem => childItem.name === separatedId[1])
        } else {
            return lpu.name === id
        }
    })

    const connection = selectedLpu?.connect;
    if(selectedLpu && selectedLpu.childElements && separatedId[1]) {
        const selectedChild = selectedLpu.childElements.filter(lpu => lpu.name === separatedId[1])[0];
        if(selectedChild) {
            selectedLpu = selectedChild;
            if(connection && selectedLpu && !selectedLpu?.connect)
                selectedLpu.connect = connection;
        }

    }

    if(separatedId.length > 1 && isEmpty(selectedLpu?.childElements)) {
        selectedLpu = undefined;
    }

    return selectedLpu;
}