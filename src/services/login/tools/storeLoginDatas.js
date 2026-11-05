import { useUserStore } from "@/hooks/useUserStore";
import { cacheProfilePhoto } from "@/utils/profilePhoto";

export default function storeDatas({ data, token }) {
    if (!data) return;

    const isAlreadyFormatted = data && "name" in data;

    const formattedProfile = isAlreadyFormatted
        ? data
        : {
              id: data.id,
              name: data.prenom,
              surname: data.nom,
              sex: data.profile?.sexe || "",
              phone: data.profile?.telPortable || "",
              email: data.email || "",
              schoolName: data.nomEtablissement || "",
              photoUrl: data.profile?.photo || "",
              class: {
                  libelle: data.profile?.classe?.libelle || "",
                  code: data.profile?.classe?.code || "",
              },
          };
    const currentProfile = useUserStore.getState().profile;
    const mergedProfile = currentProfile
        ? {
              ...formattedProfile,
              localPhotoUri:
                  currentProfile.localPhotoUri || formattedProfile.localPhotoUri,
          }
        : formattedProfile;
    useUserStore.getState().setProfile(mergedProfile);

    if (token) {
        useUserStore.getState().setToken(token);
    }

    if (formattedProfile.photoUrl && !mergedProfile.localPhotoUri && token) {
        cacheProfilePhoto(
            formattedProfile.id,
            formattedProfile.photoUrl,
            token
        ).then((localPath) => {
            if (localPath) {
                useUserStore.getState().setProfile({
                    ...mergedProfile,
                    localPhotoUri: localPath,
                });
            }
        });
    }
}
