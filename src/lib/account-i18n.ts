import { defaultLocale, isLocale, type Locale } from './i18n'

type AccountI18n = {
  authLayout: {
    visualOverlay: string
  }
  auth: {
    signIn: {
      title: string
      emailLabel: string
      passwordLabel: string
      emailPlaceholder: string
      passwordPlaceholder: string
      submit: string
      submitting: string
      forgotPassword: string
      noAccount: string
      signupCta: string
      errors: {
        generic: string
        network: string
      }
    }
    signUp: {
      title: string
      passwordPolicy: string
      firstNamePlaceholder: string
      lastNamePlaceholder: string
      emailPlaceholder: string
      passwordPlaceholder: string
      submit: string
      submitting: string
      hasAccount: string
      signInCta: string
      success: string
      errors: {
        generic: string
        network: string
      }
    }
    forgotPassword: {
      title: string
      subtitle: string
      emailPlaceholder: string
      submit: string
      submitting: string
      cancel: string
      success: string
      errors: {
        generic: string
        network: string
      }
    }
    resetPassword: {
      title: string
      subtitle: string
      passwordPolicy: string
      tokenPlaceholder: string
      passwordPlaceholder: string
      submit: string
      submitting: string
      backToSignIn: string
      success: string
      errors: {
        generic: string
        network: string
      }
    }
    verifyEmail: {
      title: string
      goToSignIn: string
      loading: string
      missingToken: string
      genericError: string
      success: string
      networkError: string
    }
    logout: {
      fallbackLabel: string
      submitting: string
      errors: {
        generic: string
        network: string
      }
    }
  }
  account: {
    nav: {
      ariaLabel: string
      overview: string
      orders: string
      addresses: string
    }
    help: string
    contactUs: string
    fallbackCustomer: string
    overview: {
      greeting: string
      yourInfo: string
      firstName: string
      lastName: string
      phone: string
      email: string
      saveProfile: string
      savingProfile: string
      profileSaved: string
      profileSaveError: string
      profileNetworkError: string
      defaultAddress: string
      viewAddressBook: string
      noDefaultAddress: string
      changeDefaultAddress: string
    }
    orders: {
      empty: string
      title: string
    }
    addresses: {
      title: string
      defaultAddress: string
      noAddress: string
      edit: string
      delete: string
      addNewAddress: string
      formTitle: string
      firstName: string
      lastName: string
      company: string
      streetAddress: string
      apartment: string
      city: string
      country: string
      province: string
      postalCode: string
      phone: string
      setDefaultAddress: string
      saveAddress: string
      cancel: string
      limitHint: string
      countryItaly: string
      provinceMonza: string
      provinceMilano: string
    }
  }
  authEmail: {
    verify: {
      subject: string
      greeting: string
      intro: string
      ctaLabel: string
      outro: string
    }
  }
}

const accountDictionary: Record<Locale, AccountI18n> = {
  it: {
    authLayout: {
      visualOverlay: "E' il momento di investire nella tua PELLE.",
    },
    auth: {
      signIn: {
        title: 'Login',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        submit: 'ACCEDI',
        submitting: 'ACCESSO...',
        forgotPassword: 'Hai dimenticato la password?',
        noAccount: 'Non hai un account?',
        signupCta: 'Registrati!',
        errors: {
          generic: 'Accesso non riuscito. Controlla le credenziali.',
          network: 'Errore di rete durante il login. Riprova.',
        },
      },
      signUp: {
        title: 'Crea account',
        passwordPolicy:
          'La password deve avere almeno 10 caratteri e includere maiuscole, minuscole, numero e simbolo speciale.',
        firstNamePlaceholder: 'Nome',
        lastNamePlaceholder: 'Cognome',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        submit: 'REGISTRATI',
        submitting: 'REGISTRAZIONE...',
        hasAccount: 'Hai gia un account?',
        signInCta: 'Accedi!',
        success: "Account creato. Verifica l'email prima di effettuare il login.",
        errors: {
          generic: 'Impossibile creare account ora. Riprova piu tardi.',
          network: 'Errore di rete durante la registrazione. Riprova.',
        },
      },
      forgotPassword: {
        title: 'Reimposta password',
        subtitle: 'Ti invieremo un link via email per reimpostare la password.',
        emailPlaceholder: 'Email',
        submit: 'INVIA',
        submitting: 'INVIO...',
        cancel: 'ANNULLA',
        success: "Se l'email esiste, abbiamo inviato un link di reset.",
        errors: {
          generic: 'Impossibile completare la richiesta in questo momento.',
          network: 'Errore di rete durante la richiesta reset. Riprova.',
        },
      },
      resetPassword: {
        title: 'Imposta nuova password',
        subtitle: 'Inserisci il token e scegli una nuova password.',
        passwordPolicy:
          'La password deve avere almeno 10 caratteri con maiuscola, minuscola, numero e simbolo speciale.',
        tokenPlaceholder: 'Token reset',
        passwordPlaceholder: 'Nuova password',
        submit: 'AGGIORNA PASSWORD',
        submitting: 'AGGIORNAMENTO...',
        backToSignIn: 'Torna al login',
        success: 'Password aggiornata. Ora puoi accedere.',
        errors: {
          generic: 'Impossibile reimpostare la password.',
          network: 'Errore di rete durante il reset password. Riprova.',
        },
      },
      verifyEmail: {
        title: 'Verifica email',
        goToSignIn: 'VAI AL LOGIN',
        loading: 'Verifica email in corso...',
        missingToken: "Token di verifica mancante. Riapri il link dall'email.",
        genericError: 'Impossibile verificare questo account. Il link potrebbe essere scaduto.',
        success: 'Email verificata. Ora puoi accedere.',
        networkError: 'Errore di rete durante la verifica. Riprova tra qualche minuto.',
      },
      logout: {
        fallbackLabel: 'Logout',
        submitting: 'Uscita...',
        errors: {
          generic: 'Logout non disponibile ora. Riprova.',
          network: 'Errore di rete durante il logout. Riprova.',
        },
      },
    },
    account: {
      nav: {
        ariaLabel: 'Sezioni account',
        overview: 'Panoramica account',
        orders: 'Ordini',
        addresses: 'Indirizzi',
      },
      help: 'Hai bisogno di aiuto?',
      contactUs: 'Contattaci.',
      fallbackCustomer: 'Cliente',
      overview: {
        greeting: 'Ciao',
        yourInfo: 'I tuoi dati',
        firstName: 'Nome',
        lastName: 'Cognome',
        phone: 'Telefono',
        email: 'Email',
        saveProfile: 'Salva profilo',
        savingProfile: 'Salvataggio...',
        profileSaved: 'Profilo aggiornato con successo.',
        profileSaveError: 'Impossibile aggiornare il profilo ora.',
        profileNetworkError: 'Errore di rete durante il salvataggio del profilo.',
        defaultAddress: 'Indirizzo predefinito',
        viewAddressBook: 'Vedi rubrica indirizzi',
        noDefaultAddress: 'Nessun indirizzo predefinito.',
        changeDefaultAddress: 'Cambia indirizzo predefinito',
      },
      orders: {
        empty: 'Non hai ancora effettuato ordini.',
        title: 'I tuoi ordini',
      },
      addresses: {
        title: 'I tuoi indirizzi',
        defaultAddress: 'Indirizzo predefinito',
        noAddress: 'Nessun indirizzo salvato',
        edit: 'Modifica',
        delete: 'Elimina',
        addNewAddress: 'Aggiungi nuovo indirizzo',
        formTitle: 'Aggiungi un nuovo indirizzo',
        firstName: 'Nome',
        lastName: 'Cognome',
        company: 'Azienda',
        streetAddress: 'Indirizzo',
        apartment: 'Appartamento, scala, interno (opzionale)',
        city: 'Citta',
        country: 'Paese',
        province: 'Provincia',
        postalCode: 'CAP',
        phone: 'Telefono',
        setDefaultAddress: 'Imposta come indirizzo predefinito',
        saveAddress: 'Salva indirizzo',
        cancel: 'Annulla',
        limitHint: 'Limite 30 caratteri',
        countryItaly: 'Italia',
        provinceMonza: 'Monza e Brianza',
        provinceMilano: 'Milano',
      },
    },
    authEmail: {
      verify: {
        subject: 'Conferma il tuo account DOB Milano',
        greeting: 'Ciao',
        intro: 'Conferma il tuo account DOB Milano cliccando il link qui sotto:',
        ctaLabel: 'Verifica account',
        outro: 'Se non hai creato un account, ignora questa email.',
      },
    },
  },
  en: {
    authLayout: {
      visualOverlay: "It's time to invest in your SKIN.",
    },
    auth: {
      signIn: {
        title: 'Login',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        submit: 'SIGN IN',
        submitting: 'SIGNING IN...',
        forgotPassword: 'Forgot your password?',
        noAccount: "Don't have an account?",
        signupCta: 'Sign up!',
        errors: {
          generic: 'Unable to sign in. Check your credentials.',
          network: 'Network error while signing in. Please retry.',
        },
      },
      signUp: {
        title: 'Create Account',
        passwordPolicy:
          'Password must be at least 10 chars and include upper/lowercase, number and special symbol.',
        firstNamePlaceholder: 'First Name',
        lastNamePlaceholder: 'Last Name',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        submit: 'REGISTER',
        submitting: 'REGISTERING...',
        hasAccount: 'Already have an account?',
        signInCta: 'Sign in!',
        success: 'Account created. Check your email and verify your account before signing in.',
        errors: {
          generic: 'Unable to create account right now. Please contact support or try later.',
          network: 'Network error while creating your account. Please retry.',
        },
      },
      forgotPassword: {
        title: 'Reset your password',
        subtitle: 'We will send you an email to reset your password.',
        emailPlaceholder: 'Email',
        submit: 'SUBMIT',
        submitting: 'SUBMITTING...',
        cancel: 'CANCEL',
        success: 'If this email exists, a reset link has been sent.',
        errors: {
          generic: 'Unable to process the request right now.',
          network: 'Network error while requesting password reset. Please retry.',
        },
      },
      resetPassword: {
        title: 'Set new password',
        subtitle: 'Insert token and choose a new password.',
        passwordPolicy:
          'Password must be at least 10 chars with upper/lowercase, number and special symbol.',
        tokenPlaceholder: 'Reset token',
        passwordPlaceholder: 'New password',
        submit: 'UPDATE PASSWORD',
        submitting: 'UPDATING...',
        backToSignIn: 'Back to sign in',
        success: 'Password updated. You can now sign in.',
        errors: {
          generic: 'Unable to reset password.',
          network: 'Network error while resetting password. Please retry.',
        },
      },
      verifyEmail: {
        title: 'Email verification',
        goToSignIn: 'GO TO SIGN IN',
        loading: 'Verifying your email...',
        missingToken: 'Missing verification token. Open the link from your email again.',
        genericError: 'Unable to verify this account. The link may be expired.',
        success: 'Email verified. You can now sign in.',
        networkError: 'Network error while verifying account. Try again in a few minutes.',
      },
      logout: {
        fallbackLabel: 'Logout',
        submitting: 'Signing out...',
        errors: {
          generic: 'Unable to logout now. Retry.',
          network: 'Network error while logging out. Retry.',
        },
      },
    },
    account: {
      nav: {
        ariaLabel: 'Account sections',
        overview: 'Account overview',
        orders: 'Orders',
        addresses: 'Addresses',
      },
      help: 'Need help?',
      contactUs: 'Contact us.',
      fallbackCustomer: 'Customer',
      overview: {
        greeting: 'Hi',
        yourInfo: 'Your info',
        firstName: 'First name',
        lastName: 'Last name',
        phone: 'Phone',
        email: 'Email',
        saveProfile: 'Save profile',
        savingProfile: 'Saving...',
        profileSaved: 'Profile updated successfully.',
        profileSaveError: 'Unable to update profile right now.',
        profileNetworkError: 'Network error while saving profile.',
        defaultAddress: 'Default Address',
        viewAddressBook: 'View address book',
        noDefaultAddress: 'No default address yet.',
        changeDefaultAddress: 'Change default address',
      },
      orders: {
        empty: "You haven't placed any orders yet.",
        title: 'Your orders',
      },
      addresses: {
        title: 'Your addresses',
        defaultAddress: 'Default Address',
        noAddress: 'No address yet.',
        edit: 'Edit',
        delete: 'Delete',
        addNewAddress: 'Add new address',
        formTitle: 'Add a New Address',
        firstName: 'First Name',
        lastName: 'Last Name',
        company: 'Company',
        streetAddress: 'Street Address',
        apartment: 'Apartment, Suite, Building (Optional)',
        city: 'City',
        country: 'Country',
        province: 'Province',
        postalCode: 'Postal code',
        phone: 'Phone',
        setDefaultAddress: 'Set as default address',
        saveAddress: 'Save address',
        cancel: 'Cancel',
        limitHint: 'Limit 30 characters',
        countryItaly: 'Italy',
        provinceMonza: 'Monza and Brianza',
        provinceMilano: 'Milano',
      },
    },
    authEmail: {
      verify: {
        subject: 'Verify your DOB Milano account',
        greeting: 'Hi',
        intro: 'Verify your DOB Milano account by clicking the link below:',
        ctaLabel: 'Verify account',
        outro: "If you didn't create an account, just ignore this email.",
      },
    },
  },
  ru: {
    authLayout: {
      visualOverlay: 'Время инвестировать в вашу КОЖУ.',
    },
    auth: {
      signIn: {
        title: 'Вход',
        emailLabel: 'Email',
        passwordLabel: 'Пароль',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Пароль',
        submit: 'ВОЙТИ',
        submitting: 'ВХОД...',
        forgotPassword: 'Забыли пароль?',
        noAccount: 'Нет аккаунта?',
        signupCta: 'Зарегистрироваться!',
        errors: {
          generic: 'Не удалось войти. Проверьте данные.',
          network: 'Ошибка сети при входе. Повторите попытку.',
        },
      },
      signUp: {
        title: 'Создать аккаунт',
        passwordPolicy:
          'Пароль должен содержать минимум 10 символов, включая верхний/нижний регистр, цифру и специальный символ.',
        firstNamePlaceholder: 'Имя',
        lastNamePlaceholder: 'Фамилия',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Пароль',
        submit: 'РЕГИСТРАЦИЯ',
        submitting: 'РЕГИСТРАЦИЯ...',
        hasAccount: 'Уже есть аккаунт?',
        signInCta: 'Войти!',
        success: 'Аккаунт создан. Подтвердите email перед входом.',
        errors: {
          generic: 'Не удалось создать аккаунт. Повторите попытку позже.',
          network: 'Ошибка сети при регистрации. Повторите попытку.',
        },
      },
      forgotPassword: {
        title: 'Сброс пароля',
        subtitle: 'Мы отправим вам письмо для сброса пароля.',
        emailPlaceholder: 'Email',
        submit: 'ОТПРАВИТЬ',
        submitting: 'ОТПРАВКА...',
        cancel: 'ОТМЕНА',
        success: 'Если email существует, ссылка для сброса отправлена.',
        errors: {
          generic: 'Сейчас не удалось обработать запрос.',
          network: 'Ошибка сети при запросе сброса. Повторите попытку.',
        },
      },
      resetPassword: {
        title: 'Новый пароль',
        subtitle: 'Введите токен и задайте новый пароль.',
        passwordPolicy:
          'Пароль должен содержать минимум 10 символов, верхний/нижний регистр, цифру и специальный символ.',
        tokenPlaceholder: 'Токен сброса',
        passwordPlaceholder: 'Новый пароль',
        submit: 'ОБНОВИТЬ ПАРОЛЬ',
        submitting: 'ОБНОВЛЕНИЕ...',
        backToSignIn: 'Вернуться ко входу',
        success: 'Пароль обновлен. Теперь можно войти.',
        errors: {
          generic: 'Не удалось сбросить пароль.',
          network: 'Ошибка сети при сбросе пароля. Повторите попытку.',
        },
      },
      verifyEmail: {
        title: 'Подтверждение email',
        goToSignIn: 'ПЕРЕЙТИ КО ВХОДУ',
        loading: 'Подтверждаем email...',
        missingToken: 'Токен подтверждения отсутствует. Откройте ссылку из письма снова.',
        genericError: 'Не удалось подтвердить аккаунт. Возможно, ссылка устарела.',
        success: 'Email подтвержден. Теперь можно войти.',
        networkError: 'Ошибка сети при подтверждении. Повторите попытку позже.',
      },
      logout: {
        fallbackLabel: 'Выйти',
        submitting: 'Выход...',
        errors: {
          generic: 'Сейчас не удалось выйти. Повторите попытку.',
          network: 'Ошибка сети при выходе. Повторите попытку.',
        },
      },
    },
    account: {
      nav: {
        ariaLabel: 'Разделы аккаунта',
        overview: 'Обзор аккаунта',
        orders: 'Заказы',
        addresses: 'Адреса',
      },
      help: 'Нужна помощь?',
      contactUs: 'Свяжитесь с нами.',
      fallbackCustomer: 'Клиент',
      overview: {
        greeting: 'Здравствуйте',
        yourInfo: 'Ваши данные',
        firstName: 'Имя',
        lastName: 'Фамилия',
        phone: 'Телефон',
        email: 'Email',
        saveProfile: 'Сохранить профиль',
        savingProfile: 'Сохранение...',
        profileSaved: 'Профиль успешно обновлен.',
        profileSaveError: 'Не удалось обновить профиль.',
        profileNetworkError: 'Ошибка сети при сохранении профиля.',
        defaultAddress: 'Адрес по умолчанию',
        viewAddressBook: 'Открыть адресную книгу',
        noDefaultAddress: 'Адрес по умолчанию не задан.',
        changeDefaultAddress: 'Изменить адрес по умолчанию',
      },
      orders: {
        empty: 'У вас пока нет заказов.',
        title: 'Ваши заказы',
      },
      addresses: {
        title: 'Ваши адреса',
        defaultAddress: 'Адрес по умолчанию',
        noAddress: 'Адреса пока не добавлены.',
        edit: 'Редактировать',
        delete: 'Удалить',
        addNewAddress: 'Добавить адрес',
        formTitle: 'Добавить новый адрес',
        firstName: 'Имя',
        lastName: 'Фамилия',
        company: 'Компания',
        streetAddress: 'Улица и дом',
        apartment: 'Квартира, подъезд, офис (опционально)',
        city: 'Город',
        country: 'Страна',
        province: 'Регион',
        postalCode: 'Индекс',
        phone: 'Телефон',
        setDefaultAddress: 'Сделать адресом по умолчанию',
        saveAddress: 'Сохранить адрес',
        cancel: 'Отмена',
        limitHint: 'Лимит 30 символов',
        countryItaly: 'Италия',
        provinceMonza: 'Monza e Brianza',
        provinceMilano: 'Milano',
      },
    },
    authEmail: {
      verify: {
        subject: 'Подтвердите аккаунт DOB Milano',
        greeting: 'Здравствуйте',
        intro: 'Подтвердите аккаунт DOB Milano, перейдя по ссылке ниже:',
        ctaLabel: 'Подтвердить аккаунт',
        outro: 'Если вы не создавали аккаунт, проигнорируйте это письмо.',
      },
    },
  },
}

export const resolveLocale = (value: string): Locale => (isLocale(value) ? value : defaultLocale)

export const getAccountDictionary = (locale: string) => accountDictionary[resolveLocale(locale)]
