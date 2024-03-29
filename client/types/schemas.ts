import * as Yup from 'yup';

export const CreateAccountSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Valid email is required').required('Valid email is required'),
  password: Yup.string()
    .required('Password is required')
    // src: https://stackoverflow.com/a/55604455/12369650
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Must Contain at least 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character',
    ),
});

export const LoginSchema = Yup.object({
  email: Yup.string().email('Valid email is required').required('Valid email is required'),
  password: Yup.string().required('Password is required'),
});

export const PasswordRecoverySchema = Yup.object({
  email: Yup.string()
    .email("Valid email is required")
    .required("Valid email is required"),
});

export const ResetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .required("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Must Contain at least 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
    ),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .test("passwords-match", "Passwords must match", function (value) {
      return this.parent.newPassword === value;
    }),
});

export const UpdateEmailSchema = Yup.object({
  email: Yup.string().email('Valid email is required').required('Valid email is required'),
  password: Yup.string().required('Password is required'),
});

export const UpdatePasswordSchema = Yup.object({
  newPassword: Yup.string()
    .required('New password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Must Contain at least 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character',
    ),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .test('passwords-match', 'Passwords must match', function (value) {
      return this.parent.newPassword === value;
    }),
  currentPassword: Yup.string().required('Current password is required'),
});

export const CreateReceiptSchema = Yup.object({
  storeName: Yup.string().required('Store Name is required'),
  cost: Yup.number().required().positive(),
  tax: Yup.number().required().positive(),
});
