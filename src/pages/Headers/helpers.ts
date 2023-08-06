import { THeaderStatus, THeadersProfile } from '../../types';

type ProfilesMap = Record<string, THeadersProfile>

export const setLastActive = (profiles: ProfilesMap | null, id: string): ProfilesMap => {
    const newProfiles = { ...profiles };
    Object.keys(newProfiles).forEach((key) => {
        newProfiles[key].lastActive = key === id;
    });
    return newProfiles;
};

export const changeProfile = (profiles: ProfilesMap | null, newProfile: THeadersProfile): ProfilesMap => {
    const newProfiles = { ...profiles };
    newProfiles[newProfile.id] = newProfile;
    return newProfiles;
};

export const addProfile = (profiles: ProfilesMap | null, newProfile: THeadersProfile): ProfilesMap => {
    const newProfiles = {
        ...profiles,
        [newProfile.id]: newProfile,
    };
    return setLastActive(newProfiles, newProfile.id);
};

export const changeProfileStatus = (profiles: ProfilesMap | null, id: string, status: THeaderStatus): ProfilesMap => {
    const newProfiles = { ...profiles };
    newProfiles[id].status = status;
    return newProfiles;
};

export const deleteProfile = (profiles: ProfilesMap | null, id: string): ProfilesMap => {
    const newProfiles = { ...profiles };
    delete newProfiles[id];
    return newProfiles;
};
