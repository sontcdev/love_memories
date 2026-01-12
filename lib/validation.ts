// PIN validation utilities

export const WEAK_PINS = [
    '000000', '111111', '222222', '333333', '444444',
    '555555', '666666', '777777', '888888', '999999',
    '123456', '654321', '112233', '121212', '131313',
    '141414', '151515', '161616', '171717', '181818',
    '191919', '202020', '212121', '232323', '242424',
]

export interface ValidationResult {
    valid: boolean
    error?: string
}

export function validatePin(pin: string): ValidationResult {
    if (pin.length !== 6) {
        return { valid: false, error: 'PIN phải có 6 số' }
    }

    if (!/^\d+$/.test(pin)) {
        return { valid: false, error: 'PIN chỉ được chứa số' }
    }

    if (WEAK_PINS.includes(pin)) {
        return {
            valid: false,
            error: 'PIN này quá dễ đoán. Vui lòng chọn PIN khác'
        }
    }

    return { valid: true }
}

export function pinsMatch(pin1: string, pin2: string): ValidationResult {
    if (pin1 !== pin2) {
        return { valid: false, error: 'Mã PIN không khớp. Vui lòng thử lại' }
    }
    return { valid: true }
}
