export const formatCurrency = (value, { locale = 'en-US', ...options }) => {
    const defaultOptions = {
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    };

    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        ...defaultOptions,
        ...options
    });

    return formatter.format(value);
};