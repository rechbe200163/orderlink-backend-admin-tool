
export const getCoordinatesFromAddress = async (address: string): Promise<{ latitude: number; longitude: number }> => {
    const geocoding = require('@aashari/nodejs-geocoding');
    try {
        const location = (await geocoding.encode(address)) as Array<{ latitude: number; longitude: number }>;
        if (location && location.length > 0) {
            const { latitude, longitude } = location[0];
            return { latitude, longitude };
        }
    } catch (err: unknown) {
        console.error('Geocoding error:', err);
    }
    return { latitude: 0, longitude: 0 };
};