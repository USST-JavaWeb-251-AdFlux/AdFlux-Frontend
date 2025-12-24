const subTitle = ref<string | null>(null);

export const useSubTitle = (title?: MaybeRefOrGetter<string | undefined | null>) => {
    if (title) {
        const stop = watchEffect(() => {
            subTitle.value = toValue(title) ?? null;
        });

        onUnmounted(() => {
            stop();
            subTitle.value = null;
        });
    }

    return subTitle;
};
