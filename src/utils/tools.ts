export const capitalize = (s: string): string => {
    if (s.length === 0) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export const formatDate = (date: Date | string | undefined): string => {
    if (!date) {
        return '未知时间';
    }
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('zh-CN', {
        dateStyle: 'short',
    });
};

export const formatDateTime = (date: Date | string | undefined): string => {
    if (!date) {
        return '未知时间';
    }
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleString('zh-CN', {
        dateStyle: 'short',
        timeStyle: 'medium',
    });
};
