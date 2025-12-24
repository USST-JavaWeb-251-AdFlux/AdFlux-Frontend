const subTitle = ref<string | null>(null);

export function useSubTitle(title?: MaybeRefOrGetter<string | undefined | null>) {
    if (title) {
        watchEffect(() => {
            subTitle.value = toValue(title) ?? null;
        });
    }

    onUnmounted(() => {
        subTitle.value = null;
    });

    return subTitle;
}
