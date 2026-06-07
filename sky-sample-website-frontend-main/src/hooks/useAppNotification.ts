import { useSnackbar, OptionsObject, SnackbarMessage } from 'notistack';
import useCurrentUser from './useCurrentUser';

export default function useAppNotification() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { user } = useCurrentUser();

    const notify = (message: SnackbarMessage, options?: OptionsObject) => {
        // If the user explicitly disabled inAppNotifications, don't show the snackbar
        if (user && user.inAppNotifications === false) {
            return;
        }
        return enqueueSnackbar(message, options);
    };

    return { notify, closeSnackbar };
}
