import Dexie, { Table } from 'dexie';
import { TMock } from '../types';

class MySubClassedDexie extends Dexie {
    // 'mocks' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    mocks!: Table<TMock>;

    constructor() {
        super('mockiato');
        this.version(100).stores({
            mocks: '++id, url',
        });
    }
}

// eslint-disable-next-line import/no-mutable-exports
export let db: MySubClassedDexie;

// TODO вынести в контекст?
export const initDB = () => {
    db = new MySubClassedDexie();
};
