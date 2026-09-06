import { MantineColor } from "@mantine/core";

export const getStatusCodeColor = (statusCode: number): MantineColor => {
    if (statusCode >= 100 && statusCode < 200) {
        return 'cyan';
    } if (statusCode >= 200 && statusCode < 300) {
        return 'green';
    } if (statusCode >= 300 && statusCode < 400) {
        return 'dark';
    } if (statusCode >= 400 && statusCode < 500) {
        return 'orange';
    }
    
    return 'red';
};