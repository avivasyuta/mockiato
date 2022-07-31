import Dexie, { Table } from 'dexie';
import { TMock } from '../types';

export let db: MySubClassedDexie

class MySubClassedDexie extends Dexie {
    // 'mocks' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    mocks!: Table<TMock>;

    constructor() {
        super('mockiato');
        this.version(100).stores({
            mocks: '++id, url'
        });
    }
}


// TODO вынести в контекст?
export const initDB = () => {
    db = new MySubClassedDexie();
}
