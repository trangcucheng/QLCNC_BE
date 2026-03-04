export const OTP = {
  REGENERATE_OTP_TIME: 300
};
export enum PriorityType {
  TTCN = 'TTCN',
}

export enum REGISTER_STATUS {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PASSED = 'PASSED',
  FAIL = 'FAIL',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  PASS_1 = 'PASS_1',
  HAS_SCORE = 'HAS_SCORE',
  PASS_2 = 'PASS_2',
}
export const APPROVAL_NOTIFICATION = {
  APPROVED: 'You have been approved.',
  PASSED: 'You have been chosen',
  FAIL: 'You were not chosen',
  CLOSED: 'Invalid registration application'
};

export const FEE_STATUS = {
  PENDING: 'PENDING',//đang chờ
  PAYMENTED: 'PAYMENTED',//admin đã phê duyệt
  REJECTED: 'REJECTED',//giao dịch bị từ chối,
  PENDING_PAYMENT: 'PENDING_PAYMENT',//đang chờ xác nhận thanh toán
}

export const PRIORITY_TYPE = {
  TUYEN_THANG_301: 'TUYEN_THANG_301',
  TUYEN_THANG_303: 'TUYEN_THANG_303',
  UU_TIEN_303: 'UU_TIEN_303'
}

export const NOTIFICATION = {
  ACCOUNT_VERIFICATION: 'account-verification',
  NEW_USER: 'new-user',
  ARTISTIC_APTITUDE_TEST_NOTIFICATION: 'artistic-aptitude-test-notification',
  EARLY_ADMISSION_REGISTRATION_NOTIFICATION: 'early-admission-registration-notification',
  UPDATE_EARLY_ADMISSION_REGISTRATION_NOTIFICATION: 'update-early-admission-registration-notification',
  ARTISTIC_APTITUDE_TEST_RESULTS_NOTIFICATION: 'artistic-aptitude-test-results-notification',
  ADMISSION_RESULTS_NOTIFICATION: 'admission-results-notification',
  INVALI_REGISTRATION_FORM_NOTIFICATON: 'invalid-registration-form-notification',
  UNSUCCESS_FUL_ADMISSION_NOTIFICATION: 'unsuccessful-admission-notification',
  ADMISSION_NOTIFICATION: 'admission-notification',
  ARTISTIC_APTITUDE_TEST_PASSED_NOTIFICATION: 'artistic-aptitude-test-passed-notification',
  ARTISTIC_APTITUDE_TEST_FAIL_NOTIFICATION: 'artistic-aptitude-test-fail-notification',
  ARTISTIC_APTITUDE_TEST_INVALID_NOTIFICATION: 'artistic-aptitude-test-invalid-notification',
  FORGOT_PASSWORD: 'forgot-password',
  PAYMENT_REMINDER: 'payment-reminder',
  EXAM_SCHEDULE_REMINDER: 'exam-schedule-reminder',
  NOTIFY_USER_APPROVAL: 'notify-user-approval',
  NOTIFY_USER_REJECTTION: 'notify-user-rejecttion',
  NOTIFY_TRANSACTION_APPROVAL: 'notify-transaction-approval',
  NOTIFY_TRANSACTION_REJECTION: 'notify-transaction-rejection',
  TRANSLATION: 'notify',
  TRANSACTION_REMINDER: 'transaction-reminder'

};
export const NOTIFICATION_SUBJECT = {
  ACCOUNT_VERIFICATION: 'Xác nhận đăng ký tài khoản',
  LOGIN: 'Đăng nhập',
  REGISTER: 'Đăng ký',
  REGISTRATION_SUCCESSFULL: 'Thông báo đăng ký thành công',
  UPDATE_REGISTRATION_SUCCESSFULL: 'Cập nhật đơn đăng ký thành công',
  ADMISSION_RESULTS_NOTIFICATION: 'Thông báo kết quả xét tuyển',
  INVALI_NOTIFICATON: 'Thông báo xét tuyển không hợp lệ',
  UNSUCCESS_FUL_ADMISSION_NOTIFICATION: 'Thông báo trượt xét tuyển',
  ADMISSION_NOTIFICATION: 'Thông báo đậu xét tuyển',
  TEST_PASSED_NOTIFICATION: 'Thông báo đậu năng khiếu mỹ thuật',
  TEST_FAIL_NOTIFICATION: 'Thông báo trượt năng khiếu mỹ thuật',
  TEST_RESULTS_NOTIFICATION: 'Thông báo kết quả thi năng khiếu mỹ thuật',
  TEST_INVALI_NOTIFICATION: 'Kết quả thi năng khiếu không hợp lệ',
  FORGOT_PASSWORD: 'Đặt lại mật khẩu',
  PAYMENT_REMINDER: 'Thông báo chưa hoàn thành lệ phí thi',
  EXAM_SCHEDULE_REMINDER: 'Thông báo thời hạn đăng ký thi gần kết thúc',
  NOTIFY: 'Thông báo',
  TRANSACTION_REMINDER: 'Thông báo giao dịch chưa thanh toán',
  FEEDBACK: 'Thông báo phản hồi'
  // TRANSLATION:'Bạn đã qua vòng sơ tuyển. Vui lòng theo dõi đơn chung tuyển!'
}

export const SCORE_TYPE = {
  MATH: 'MATH',
  LITERATURE: 'LITERATURE',
  ENGLISH: 'ENGLISH',
  HISTORY: 'HISTORY',
  GEOGRAPHY: 'GEOGRAPHY',
  SOCIAL: 'SOCIAL',
  CHEMISTRY: 'CHEMISTRY',
  PHYSICS: 'PHYSICS',
  CIVICEDUCATION: 'CIVICEDUCATION'
}
