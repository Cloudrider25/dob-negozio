import { getPayload } from 'payload'

import config from '../src/payload/config'
import {
  EMAIL_EVENT_META,
  type EmailChannel,
  type EmailEventKey,
} from '../src/lib/server/email/events'

type SeedLocale = 'it' | 'en' | 'ru'

type TemplateDefinition = {
  subject: string
  title: string
  greeting: string
  intro: string[]
  ctaLabel?: string
  ctaUrl?: string
  secondaryText?: string
  secondaryLinkLabel?: string
  secondaryLinkUrl?: string
  note?: string
  metaLines?: string[]
}

const brandFooter = `
  <p style="margin:0 0 6px 0; font-size:14px; line-height:22px; color:#1f1f1f; font-weight:700;">
    DOB - Department of Beauty
  </p>
  <p style="margin:0; font-size:12px; line-height:20px; color:#8b8b8b;">
    Beauty-tech experience
  </p>
`

const translateString = (locale: SeedLocale, value: string) => {
  if (locale === 'it') return value

  const translationMap: Record<Exclude<SeedLocale, 'it'>, Record<string, string>> = {
    en: {
      'Conferma il tuo account DOB Milano': 'Confirm your DOB Milano account',
      'Conferma il tuo account': 'Confirm your account',
      'Ciao {{user.firstName}} {{user.lastName}},': 'Hello {{user.firstName}} {{user.lastName}},',
      'Grazie per esserti registrato su <strong>DOB Milano</strong>.':
        'Thank you for signing up to <strong>DOB Milano</strong>.',
      'Per attivare il tuo account e completare la verifica, clicca sul pulsante qui sotto.':
        'To activate your account and complete verification, click the button below.',
      'Verifica account': 'Verify account',
      'Se il pulsante non funziona, copia e incolla questo link nel browser:':
        'If the button does not work, copy and paste this link into your browser:',
      'Se non hai creato un account, puoi ignorare questa email.':
        'If you did not create an account, you can ignore this email.',
      'Nuovo utente registrato su DOB Milano': 'New user registered on DOB Milano',
      'Nuovo utente registrato': 'New user registered',
      'Team DOB,': 'DOB team,',
      'Un nuovo account cliente è stato creato sulla piattaforma.':
        'A new customer account has been created on the platform.',
      'Nome: {{user.fullName}}': 'Name: {{user.fullName}}',
      'Email: {{user.email}}': 'Email: {{user.email}}',
      'Ruoli: {{user.roles}}': 'Roles: {{user.roles}}',
      'Benvenuto su DOB Milano': 'Welcome to DOB Milano',
      'Ciao {{user.fullName}},': 'Hello {{user.fullName}},',
      'Il tuo account <strong>DOB Milano</strong> è stato creato correttamente.':
        'Your <strong>DOB Milano</strong> account has been created successfully.',
      'Controlla la tua casella email per completare la verifica dell’account e iniziare a usare tutti i servizi disponibili.':
        'Check your inbox to complete account verification and start using all available services.',
      'Utente verificato su DOB Milano': 'User verified on DOB Milano',
      'Utente verificato': 'User verified',
      "Un cliente ha completato correttamente la verifica dell'account.":
        'A customer has successfully completed account verification.',
      'Reset password richiesto': 'Password reset requested',
      'È stata richiesta una procedura di reset password.':
        'A password reset procedure has been requested.',
      'IP: {{auth.ip}}': 'IP: {{auth.ip}}',
      'User agent: {{auth.userAgent}}': 'User agent: {{auth.userAgent}}',
      'Reimposta la tua password DOB Milano': 'Reset your DOB Milano password',
      'Reimposta la tua password': 'Reset your password',
      'Abbiamo ricevuto una richiesta per reimpostare la password del tuo account <strong>DOB Milano</strong>.':
        'We received a request to reset the password for your <strong>DOB Milano</strong> account.',
      'Per completare l’operazione, clicca sul pulsante qui sotto.':
        'To complete the process, click the button below.',
      'Reimposta password': 'Reset password',
      'Se non hai richiesto il reset password, puoi ignorare questa email.':
        'If you did not request a password reset, you can ignore this email.',
      'Reset password completato': 'Password reset completed',
      'Un utente ha completato con successo il reset della password.':
        'A user has successfully completed the password reset.',
      'Login riuscito': 'Successful login',
      'È stato registrato un login riuscito.': 'A successful login was recorded.',
      'Login fallito': 'Failed login',
      'È stato registrato un tentativo di login fallito.': 'A failed login attempt was recorded.',
      'Dettaglio: {{auth.message}}': 'Detail: {{auth.message}}',
      'Richiesta consulenza ricevuta': 'Consultation request received',
      'Richiesta ricevuta': 'Request received',
      'Ciao {{customer.fullName}},': 'Hello {{customer.fullName}},',
      'Grazie per aver richiesto una consulenza con <strong>DOB Milano</strong>.':
        'Thank you for requesting a consultation with <strong>DOB Milano</strong>.',
      'Il nostro team prenderà in carico la richiesta e ti contatterà al più presto.':
        'Our team will review your request and contact you as soon as possible.',
      'Telefono: {{customer.phone}}': 'Phone: {{customer.phone}}',
      'Skin type: {{consultation.skinType}}': 'Skin type: {{consultation.skinType}}',
      'Esigenze: {{consultation.concerns}}': 'Needs: {{consultation.concerns}}',
      'Nuova richiesta consulenza': 'New consultation request',
      'È arrivata una nuova richiesta di consulenza dal sito.':
        'A new consultation request has arrived from the website.',
      'Cliente: {{customer.fullName}}': 'Customer: {{customer.fullName}}',
      'Messaggio: {{consultation.message}}': 'Message: {{consultation.message}}',
      'Nuovo servizio DOB Milano: {{service.name}}': 'New DOB Milano service: {{service.name}}',
      'Nuovo servizio disponibile': 'New service available',
      'Abbiamo pubblicato un nuovo servizio su <strong>DOB Milano</strong>.':
        'We have published a new service on <strong>DOB Milano</strong>.',
      'Scopri i dettagli e prenota direttamente online.':
        'Discover the details and book directly online.',
      'Scopri il servizio': 'Discover the service',
      'Servizio: {{service.name}}': 'Service: {{service.name}}',
      'Prezzo: {{service.price}}': 'Price: {{service.price}}',
      'Durata: {{service.durationMinutes}} min': 'Duration: {{service.durationMinutes}} min',
      'Nuovo servizio pubblicato: {{service.name}}': 'New service published: {{service.name}}',
      'Nuovo servizio pubblicato': 'New service published',
      'È stato pubblicato un nuovo servizio e il trigger newsletter è stato eseguito.':
        'A new service has been published and the newsletter trigger has been executed.',
      'Link: {{service.url}}': 'Link: {{service.url}}',
      'Nuovo prodotto DOB Milano: {{product.title}}': 'New DOB Milano product: {{product.title}}',
      'Nuovo prodotto disponibile': 'New product available',
      'Abbiamo aggiunto un nuovo prodotto su <strong>DOB Milano</strong>.':
        'We have added a new product on <strong>DOB Milano</strong>.',
      'Scopri la scheda prodotto completa direttamente sul sito.':
        'Discover the full product page directly on the website.',
      'Scopri il prodotto': 'Discover the product',
      'Prodotto: {{product.title}}': 'Product: {{product.title}}',
      'Brand: {{product.brand}}': 'Brand: {{product.brand}}',
      'Nuovo prodotto pubblicato: {{product.title}}': 'New product published: {{product.title}}',
      'Nuovo prodotto pubblicato': 'New product published',
      'È stato pubblicato un nuovo prodotto e il trigger newsletter è stato eseguito.':
        'A new product has been published and the newsletter trigger has been executed.',
      'Link: {{product.url}}': 'Link: {{product.url}}',
      'Abbiamo ricevuto il tuo ordine {{order.number}}': 'We received your order {{order.number}}',
      'Ordine ricevuto': 'Order received',
      'Abbiamo registrato correttamente il tuo ordine su <strong>DOB Milano</strong>.':
        'We have successfully registered your order on <strong>DOB Milano</strong>.',
      'Di seguito trovi il riepilogo principale della richiesta.':
        'Below you can find the main summary of your request.',
      'Numero ordine: {{order.number}}': 'Order number: {{order.number}}',
      'Totale: {{order.total}}': 'Total: {{order.total}}',
      'Modalità carrello: {{order.cartMode}}': 'Cart mode: {{order.cartMode}}',
      'Fulfillment: {{order.productFulfillmentMode}}': 'Fulfillment: {{order.productFulfillmentMode}}',
      'Appuntamento: {{appointment.date}} {{appointment.time}}':
        'Appointment: {{appointment.date}} {{appointment.time}}',
      'Nuovo ordine {{order.number}}': 'New order {{order.number}}',
      'Nuovo ordine ricevuto': 'New order received',
      'È stato creato un nuovo ordine e richiede monitoraggio del checkout.':
        'A new order has been created and requires checkout monitoring.',
      'Modalità appuntamento: {{appointment.mode}}': 'Appointment mode: {{appointment.mode}}',
      'Data appuntamento: {{appointment.date}} {{appointment.time}}':
        'Appointment date: {{appointment.date}} {{appointment.time}}',
      'Conferma ordine {{order.number}}': 'Order confirmation {{order.number}}',
      'Ordine confermato': 'Order confirmed',
      'Di seguito trovi il riepilogo principale della conferma.':
        'Below you can find the main summary of the confirmation.',
      'Nuovo ordine pagato {{order.number}}': 'New paid order {{order.number}}',
      'Nuovo ordine pagato': 'New paid order',
      'È stato registrato un nuovo ordine pagato.': 'A new paid order has been recorded.',
      'Pagamento fallito per ordine {{order.number}}': 'Payment failed for order {{order.number}}',
      'Pagamento fallito': 'Payment failed',
      'Un pagamento ordine non è andato a buon fine e richiede verifica.':
        'An order payment failed and requires review.',
      'Email cliente: {{customer.email}}': 'Customer email: {{customer.email}}',
      'Motivo: {{payment.reason}}': 'Reason: {{payment.reason}}',
      'Pagamento non riuscito per ordine {{order.number}}':
        'Payment unsuccessful for order {{order.number}}',
      'Pagamento non riuscito': 'Payment unsuccessful',
      'Non siamo riusciti a processare il pagamento del tuo ordine.':
        'We were unable to process the payment for your order.',
      'Ti consigliamo di riprovare oppure contattare il team DOB Milano se il problema persiste.':
        'Please try again or contact the DOB Milano team if the problem persists.',
      'Ordine {{order.number}} annullato': 'Order {{order.number}} cancelled',
      'Ordine annullato': 'Order cancelled',
      'Ti informiamo che il tuo ordine è stato annullato.':
        'We inform you that your order has been cancelled.',
      'Se hai bisogno di supporto, il team DOB Milano è a disposizione.':
        'If you need support, the DOB Milano team is here to help.',
      'Un ordine è stato annullato e va preso in carico dal backoffice.':
        'An order has been cancelled and must be handled by the back office.',
      'Ordine {{order.number}} rimborsato': 'Order {{order.number}} refunded',
      'Rimborso confermato': 'Refund confirmed',
      'Il rimborso relativo al tuo ordine è stato registrato correttamente.':
        'The refund for your order has been registered successfully.',
      'La disponibilità dei fondi dipende dai tempi del tuo provider di pagamento.':
        'The availability of funds depends on your payment provider timings.',
      'Ordine rimborsato': 'Order refunded',
      'È stato registrato un rimborso ordine.': 'An order refund has been recorded.',
      'Richiesta appuntamento ricevuta': 'Appointment request received',
      'Abbiamo ricevuto la tua proposta di appuntamento.':
        'We received your proposed appointment slot.',
      'Ti ricontatteremo appena la disponibilità sarà confermata.':
        'We will contact you as soon as availability is confirmed.',
      'Ordine: {{order.number}}': 'Order: {{order.number}}',
      'Data: {{appointment.date}}': 'Date: {{appointment.date}}',
      'Ora: {{appointment.time}}': 'Time: {{appointment.time}}',
      'Nuova richiesta appuntamento': 'New appointment request',
      'Un cliente ha inviato una nuova richiesta di appuntamento.':
        'A customer has submitted a new appointment request.',
      'Nuova proposta appuntamento': 'New appointment proposal',
      'Ti proponiamo una nuova disponibilità per il tuo appuntamento.':
        'We are proposing a new availability for your appointment.',
      'Nota: {{appointment.note}}': 'Note: {{appointment.note}}',
      'Alternativa appuntamento proposta': 'Alternative appointment proposed',
      'Alternativa proposta': 'Alternative proposed',
      'È stata registrata una proposta alternativa di appuntamento.':
        'An alternative appointment proposal has been recorded.',
      'Appuntamento confermato': 'Appointment confirmed',
      'Il tuo appuntamento è stato confermato dal team DOB Milano.':
        'Your appointment has been confirmed by the DOB Milano team.',
      'È stata registrata una conferma appuntamento.':
        'An appointment confirmation has been recorded.',
      'Conferma appuntamento ricevuta': 'Appointment confirmation received',
      'Conferma ricevuta': 'Confirmation received',
      'Abbiamo registrato la tua conferma per l’appuntamento proposto.':
        'We have recorded your confirmation for the proposed appointment.',
      'Il cliente ha confermato l’appuntamento': 'The customer confirmed the appointment',
      'Conferma cliente ricevuta': 'Customer confirmation received',
      'Il cliente ha confermato l’appuntamento proposto.':
        'The customer confirmed the proposed appointment.',
      'Appuntamento annullato': 'Appointment cancelled',
      'Il tuo appuntamento è stato annullato.': 'Your appointment has been cancelled.',
      'È stato registrato un annullamento appuntamento.':
        'An appointment cancellation has been recorded.',
      'Spedizione creata per il tuo ordine': 'Shipping created for your order',
      'Spedizione creata': 'Shipment created',
      'La spedizione del tuo ordine è stata creata.': 'The shipment for your order has been created.',
      'Tracking: {{shipping.trackingNumber}}': 'Tracking: {{shipping.trackingNumber}}',
      'Puoi seguire lo stato della spedizione dal link qui sotto.':
        'You can follow the shipment status from the link below.',
      'È stata creata una spedizione in Sendcloud.': 'A shipment has been created in Sendcloud.',
      'Tracking disponibile per il tuo ordine': 'Tracking available for your order',
      'Tracking disponibile': 'Tracking available',
      'Il tracking del tuo ordine è ora disponibile.': 'Tracking for your order is now available.',
      'Il tracking di una spedizione è ora disponibile.':
        'Tracking for a shipment is now available.',
      'Errore invio email {{email.eventKey}}': 'Email delivery error {{email.eventKey}}',
      'Errore invio email': 'Email delivery error',
      'Un tentativo di invio email non è andato a buon fine.':
        'An email delivery attempt was not successful.',
      'Evento: {{email.eventKey}}': 'Event: {{email.eventKey}}',
      'Canale: {{email.channel}}': 'Channel: {{email.channel}}',
      'Destinatario: {{email.to}}': 'Recipient: {{email.to}}',
      'Subject: {{email.subject}}': 'Subject: {{email.subject}}',
      'Errore: {{email.errorMessage}}': 'Error: {{email.errorMessage}}',
      'Per qualsiasi dubbio, il team DOB Milano resta a disposizione.':
        'If you need any help, the DOB Milano team is here for you.',
    },
    ru: {
      'Conferma il tuo account DOB Milano': 'Подтвердите ваш аккаунт DOB Milano',
      'Conferma il tuo account': 'Подтвердите аккаунт',
      'Ciao {{user.firstName}} {{user.lastName}},': 'Здравствуйте, {{user.firstName}} {{user.lastName}},',
      'Grazie per esserti registrato su <strong>DOB Milano</strong>.':
        'Спасибо за регистрацию в <strong>DOB Milano</strong>.',
      'Per attivare il tuo account e completare la verifica, clicca sul pulsante qui sotto.':
        'Чтобы активировать аккаунт и завершить проверку, нажмите кнопку ниже.',
      'Verifica account': 'Подтвердить аккаунт',
      'Se il pulsante non funziona, copia e incolla questo link nel browser:':
        'Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:',
      'Se non hai creato un account, puoi ignorare questa email.':
        'Если вы не создавали аккаунт, просто проигнорируйте это письмо.',
      'Nuovo utente registrato su DOB Milano': 'Новый пользователь зарегистрирован в DOB Milano',
      'Nuovo utente registrato': 'Новый пользователь зарегистрирован',
      'Team DOB,': 'Команда DOB,',
      'Un nuovo account cliente è stato creato sulla piattaforma.':
        'На платформе был создан новый аккаунт клиента.',
      'Nome: {{user.fullName}}': 'Имя: {{user.fullName}}',
      'Email: {{user.email}}': 'Email: {{user.email}}',
      'Ruoli: {{user.roles}}': 'Роли: {{user.roles}}',
      'Benvenuto su DOB Milano': 'Добро пожаловать в DOB Milano',
      'Ciao {{user.fullName}},': 'Здравствуйте, {{user.fullName}},',
      'Il tuo account <strong>DOB Milano</strong> è stato creato correttamente.':
        'Ваш аккаунт <strong>DOB Milano</strong> успешно создан.',
      'Controlla la tua casella email per completare la verifica dell’account e iniziare a usare tutti i servizi disponibili.':
        'Проверьте почту, чтобы завершить подтверждение аккаунта и начать пользоваться всеми доступными услугами.',
      'Utente verificato su DOB Milano': 'Пользователь подтвержден в DOB Milano',
      'Utente verificato': 'Пользователь подтвержден',
      "Un cliente ha completato correttamente la verifica dell'account.":
        'Клиент успешно завершил подтверждение аккаунта.',
      'Reset password richiesto': 'Запрошен сброс пароля',
      'È stata richiesta una procedura di reset password.':
        'Был запрошен сброс пароля.',
      'IP: {{auth.ip}}': 'IP: {{auth.ip}}',
      'User agent: {{auth.userAgent}}': 'User agent: {{auth.userAgent}}',
      'Reimposta la tua password DOB Milano': 'Сбросьте пароль DOB Milano',
      'Reimposta la tua password': 'Сбросить пароль',
      'Abbiamo ricevuto una richiesta per reimpostare la password del tuo account <strong>DOB Milano</strong>.':
        'Мы получили запрос на сброс пароля вашего аккаунта <strong>DOB Milano</strong>.',
      'Per completare l’operazione, clicca sul pulsante qui sotto.':
        'Чтобы завершить процесс, нажмите кнопку ниже.',
      'Reimposta password': 'Сбросить пароль',
      'Se non hai richiesto il reset password, puoi ignorare questa email.':
        'Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.',
      'Reset password completato': 'Сброс пароля завершен',
      'Un utente ha completato con successo il reset della password.':
        'Пользователь успешно завершил сброс пароля.',
      'Login riuscito': 'Успешный вход',
      'È stato registrato un login riuscito.': 'Зафиксирован успешный вход.',
      'Login fallito': 'Неудачный вход',
      'È stato registrato un tentativo di login fallito.': 'Зафиксирована неудачная попытка входа.',
      'Dettaglio: {{auth.message}}': 'Деталь: {{auth.message}}',
      'Richiesta consulenza ricevuta': 'Запрос на консультацию получен',
      'Richiesta ricevuta': 'Запрос получен',
      'Ciao {{customer.fullName}},': 'Здравствуйте, {{customer.fullName}},',
      'Grazie per aver richiesto una consulenza con <strong>DOB Milano</strong>.':
        'Спасибо за запрос консультации в <strong>DOB Milano</strong>.',
      'Il nostro team prenderà in carico la richiesta e ti contatterà al più presto.':
        'Наша команда рассмотрит ваш запрос и свяжется с вами в ближайшее время.',
      'Telefono: {{customer.phone}}': 'Телефон: {{customer.phone}}',
      'Skin type: {{consultation.skinType}}': 'Тип кожи: {{consultation.skinType}}',
      'Esigenze: {{consultation.concerns}}': 'Потребности: {{consultation.concerns}}',
      'Nuova richiesta consulenza': 'Новый запрос на консультацию',
      'È arrivata una nuova richiesta di consulenza dal sito.':
        'С сайта поступил новый запрос на консультацию.',
      'Cliente: {{customer.fullName}}': 'Клиент: {{customer.fullName}}',
      'Messaggio: {{consultation.message}}': 'Сообщение: {{consultation.message}}',
      'Nuovo servizio DOB Milano: {{service.name}}': 'Новая услуга DOB Milano: {{service.name}}',
      'Nuovo servizio disponibile': 'Новая услуга доступна',
      'Abbiamo pubblicato un nuovo servizio su <strong>DOB Milano</strong>.':
        'Мы опубликовали новую услугу в <strong>DOB Milano</strong>.',
      'Scopri i dettagli e prenota direttamente online.':
        'Узнайте подробности и забронируйте онлайн.',
      'Scopri il servizio': 'Открыть услугу',
      'Servizio: {{service.name}}': 'Услуга: {{service.name}}',
      'Prezzo: {{service.price}}': 'Цена: {{service.price}}',
      'Durata: {{service.durationMinutes}} min': 'Длительность: {{service.durationMinutes}} мин',
      'Nuovo servizio pubblicato: {{service.name}}': 'Опубликована новая услуга: {{service.name}}',
      'Nuovo servizio pubblicato': 'Опубликована новая услуга',
      'È stato pubblicato un nuovo servizio e il trigger newsletter è stato eseguito.':
        'Опубликована новая услуга, и триггер рассылки был выполнен.',
      'Link: {{service.url}}': 'Ссылка: {{service.url}}',
      'Nuovo prodotto DOB Milano: {{product.title}}': 'Новый продукт DOB Milano: {{product.title}}',
      'Nuovo prodotto disponibile': 'Новый продукт доступен',
      'Abbiamo aggiunto un nuovo prodotto su <strong>DOB Milano</strong>.':
        'Мы добавили новый продукт в <strong>DOB Milano</strong>.',
      'Scopri la scheda prodotto completa direttamente sul sito.':
        'Откройте полную карточку продукта прямо на сайте.',
      'Scopri il prodotto': 'Открыть продукт',
      'Prodotto: {{product.title}}': 'Продукт: {{product.title}}',
      'Brand: {{product.brand}}': 'Бренд: {{product.brand}}',
      'Nuovo prodotto pubblicato: {{product.title}}': 'Опубликован новый продукт: {{product.title}}',
      'Nuovo prodotto pubblicato': 'Опубликован новый продукт',
      'È stato pubblicato un nuovo prodotto e il trigger newsletter è stato eseguito.':
        'Опубликован новый продукт, и триггер рассылки был выполнен.',
      'Link: {{product.url}}': 'Ссылка: {{product.url}}',
      'Abbiamo ricevuto il tuo ordine {{order.number}}': 'Мы получили ваш заказ {{order.number}}',
      'Ordine ricevuto': 'Заказ получен',
      'Abbiamo registrato correttamente il tuo ordine su <strong>DOB Milano</strong>.':
        'Мы успешно зарегистрировали ваш заказ в <strong>DOB Milano</strong>.',
      'Di seguito trovi il riepilogo principale della richiesta.':
        'Ниже приведено основное резюме вашего запроса.',
      'Numero ordine: {{order.number}}': 'Номер заказа: {{order.number}}',
      'Totale: {{order.total}}': 'Итого: {{order.total}}',
      'Modalità carrello: {{order.cartMode}}': 'Режим корзины: {{order.cartMode}}',
      'Fulfillment: {{order.productFulfillmentMode}}': 'Исполнение: {{order.productFulfillmentMode}}',
      'Appuntamento: {{appointment.date}} {{appointment.time}}':
        'Визит: {{appointment.date}} {{appointment.time}}',
      'Nuovo ordine {{order.number}}': 'Новый заказ {{order.number}}',
      'Nuovo ordine ricevuto': 'Получен новый заказ',
      'È stato creato un nuovo ordine e richiede monitoraggio del checkout.':
        'Создан новый заказ, требуется контроль checkout.',
      'Modalità appuntamento: {{appointment.mode}}': 'Режим визита: {{appointment.mode}}',
      'Data appuntamento: {{appointment.date}} {{appointment.time}}':
        'Дата визита: {{appointment.date}} {{appointment.time}}',
      'Conferma ordine {{order.number}}': 'Подтверждение заказа {{order.number}}',
      'Ordine confermato': 'Заказ подтвержден',
      'Di seguito trovi il riepilogo principale della conferma.':
        'Ниже приведено основное резюме подтверждения.',
      'Nuovo ordine pagato {{order.number}}': 'Новый оплаченный заказ {{order.number}}',
      'Nuovo ordine pagato': 'Новый оплаченный заказ',
      'È stato registrato un nuovo ordine pagato.': 'Зафиксирован новый оплаченный заказ.',
      'Pagamento fallito per ordine {{order.number}}': 'Ошибка оплаты заказа {{order.number}}',
      'Pagamento fallito': 'Ошибка оплаты',
      'Un pagamento ordine non è andato a buon fine e richiede verifica.':
        'Оплата заказа не прошла и требует проверки.',
      'Email cliente: {{customer.email}}': 'Email клиента: {{customer.email}}',
      'Motivo: {{payment.reason}}': 'Причина: {{payment.reason}}',
      'Pagamento non riuscito per ordine {{order.number}}':
        'Оплата не удалась для заказа {{order.number}}',
      'Pagamento non riuscito': 'Оплата не удалась',
      'Non siamo riusciti a processare il pagamento del tuo ordine.':
        'Нам не удалось обработать оплату вашего заказа.',
      'Ti consigliamo di riprovare oppure contattare il team DOB Milano se il problema persiste.':
        'Попробуйте снова или свяжитесь с командой DOB Milano, если проблема сохраняется.',
      'Ordine {{order.number}} annullato': 'Заказ {{order.number}} отменен',
      'Ordine annullato': 'Заказ отменен',
      'Ti informiamo che il tuo ordine è stato annullato.':
        'Сообщаем вам, что ваш заказ был отменен.',
      'Se hai bisogno di supporto, il team DOB Milano è a disposizione.':
        'Если вам нужна помощь, команда DOB Milano готова помочь.',
      'Un ordine è stato annullato e va preso in carico dal backoffice.':
        'Заказ был отменен и должен быть обработан back office.',
      'Ordine {{order.number}} rimborsato': 'Заказ {{order.number}} возвращен',
      'Rimborso confermato': 'Возврат подтвержден',
      'Il rimborso relativo al tuo ordine è stato registrato correttamente.':
        'Возврат по вашему заказу успешно зарегистрирован.',
      'La disponibilità dei fondi dipende dai tempi del tuo provider di pagamento.':
        'Срок зачисления средств зависит от вашего платежного провайдера.',
      'Ordine rimborsato': 'Заказ возвращен',
      'È stato registrato un rimborso ordine.': 'Зафиксирован возврат по заказу.',
      'Richiesta appuntamento ricevuta': 'Запрос на запись получен',
      'Abbiamo ricevuto la tua proposta di appuntamento.':
        'Мы получили ваше предложение по времени визита.',
      'Ti ricontatteremo appena la disponibilità sarà confermata.':
        'Мы свяжемся с вами, как только доступность будет подтверждена.',
      'Ordine: {{order.number}}': 'Заказ: {{order.number}}',
      'Data: {{appointment.date}}': 'Дата: {{appointment.date}}',
      'Ora: {{appointment.time}}': 'Время: {{appointment.time}}',
      'Nuova richiesta appuntamento': 'Новый запрос на запись',
      'Un cliente ha inviato una nuova richiesta di appuntamento.':
        'Клиент отправил новый запрос на запись.',
      'Nuova proposta appuntamento': 'Новое предложение по записи',
      'Ti proponiamo una nuova disponibilità per il tuo appuntamento.':
        'Мы предлагаем новое время для вашего визита.',
      'Nota: {{appointment.note}}': 'Примечание: {{appointment.note}}',
      'Alternativa appuntamento proposta': 'Предложена альтернативная запись',
      'Alternativa proposta': 'Предложена альтернатива',
      'È stata registrata una proposta alternativa di appuntamento.':
        'Зафиксировано альтернативное предложение по записи.',
      'Appuntamento confermato': 'Запись подтверждена',
      'Il tuo appuntamento è stato confermato dal team DOB Milano.':
        'Ваш визит подтвержден командой DOB Milano.',
      'È stata registrata una conferma appuntamento.':
        'Зафиксировано подтверждение записи.',
      'Conferma appuntamento ricevuta': 'Подтверждение записи получено',
      'Conferma ricevuta': 'Подтверждение получено',
      'Abbiamo registrato la tua conferma per l’appuntamento proposto.':
        'Мы зарегистрировали ваше подтверждение предложенной записи.',
      'Il cliente ha confermato l’appuntamento': 'Клиент подтвердил запись',
      'Conferma cliente ricevuta': 'Подтверждение от клиента получено',
      'Il cliente ha confermato l’appuntamento proposto.':
        'Клиент подтвердил предложенную запись.',
      'Appuntamento annullato': 'Запись отменена',
      'Il tuo appuntamento è stato annullato.': 'Ваш визит был отменен.',
      'È stato registrato un annullamento appuntamento.':
        'Зафиксирована отмена записи.',
      'Spedizione creata per il tuo ordine': 'Отгрузка создана для вашего заказа',
      'Spedizione creata': 'Отгрузка создана',
      'La spedizione del tuo ordine è stata creata.': 'Отгрузка вашего заказа была создана.',
      'Tracking: {{shipping.trackingNumber}}': 'Трекинг: {{shipping.trackingNumber}}',
      'Puoi seguire lo stato della spedizione dal link qui sotto.':
        'Вы можете отслеживать статус отправления по ссылке ниже.',
      'È stata creata una spedizione in Sendcloud.': 'В Sendcloud создано отправление.',
      'Tracking disponibile per il tuo ordine': 'Трекинг доступен для вашего заказа',
      'Tracking disponibile': 'Трекинг доступен',
      'Il tracking del tuo ordine è ora disponibile.': 'Трекинг вашего заказа теперь доступен.',
      'Il tracking di una spedizione è ora disponibile.':
        'Трекинг отправления теперь доступен.',
      'Errore invio email {{email.eventKey}}': 'Ошибка отправки email {{email.eventKey}}',
      'Errore invio email': 'Ошибка отправки email',
      'Un tentativo di invio email non è andato a buon fine.':
        'Попытка отправки email завершилась неудачно.',
      'Evento: {{email.eventKey}}': 'Событие: {{email.eventKey}}',
      'Canale: {{email.channel}}': 'Канал: {{email.channel}}',
      'Destinatario: {{email.to}}': 'Получатель: {{email.to}}',
      'Subject: {{email.subject}}': 'Тема: {{email.subject}}',
      'Errore: {{email.errorMessage}}': 'Ошибка: {{email.errorMessage}}',
      'Per qualsiasi dubbio, il team DOB Milano resta a disposizione.':
        'Если у вас есть вопросы, команда DOB Milano к вашим услугам.',
    },
  }

  return translationMap[locale][value] || value
}

const localizeDefinition = (definition: TemplateDefinition, locale: SeedLocale): TemplateDefinition => ({
  subject: translateString(locale, definition.subject),
  title: translateString(locale, definition.title),
  greeting: translateString(locale, definition.greeting),
  intro: definition.intro.map((entry) => translateString(locale, entry)),
  ctaLabel: definition.ctaLabel ? translateString(locale, definition.ctaLabel) : undefined,
  ctaUrl: definition.ctaUrl,
  secondaryText: definition.secondaryText ? translateString(locale, definition.secondaryText) : undefined,
  secondaryLinkLabel: definition.secondaryLinkLabel
    ? translateString(locale, definition.secondaryLinkLabel)
    : undefined,
  secondaryLinkUrl: definition.secondaryLinkUrl,
  note: definition.note ? translateString(locale, definition.note) : undefined,
  metaLines: definition.metaLines?.map((entry) => translateString(locale, entry)),
})

const buildHtml = (definition: TemplateDefinition, locale: SeedLocale) => {
  const introHtml = definition.intro
    .map(
      (paragraph) => `
        <p style="margin:0 0 16px 0; font-size:16px; line-height:26px; color:#4a4a4a;">
          ${paragraph}
        </p>
      `,
    )
    .join('')

  const metaBlock =
    definition.metaLines && definition.metaLines.length > 0
      ? `
        <tr>
          <td style="padding:0 32px 8px 32px;">
            <div style="background-color:#f8f5f1; border-radius:14px; padding:18px 18px;">
              ${definition.metaLines
                .map(
                  (line) => `
                    <p style="margin:0 0 8px 0; font-size:14px; line-height:24px; color:#5b5b5b;">
                      ${line}
                    </p>
                  `,
                )
                .join('')}
            </div>
          </td>
        </tr>
      `
      : ''

  const secondaryBlock =
    definition.secondaryText || definition.secondaryLinkUrl
      ? `
        <tr>
          <td style="padding:0 32px 8px 32px;">
            <div style="background-color:#f8f5f1; border-radius:14px; padding:18px 18px;">
              ${
                definition.secondaryText
                  ? `
                    <p style="margin:0; font-size:14px; line-height:24px; color:#5b5b5b;">
                      ${definition.secondaryText}
                    </p>
                  `
                  : ''
              }
              ${
                definition.secondaryLinkUrl
                  ? `
                    <p style="margin:${definition.secondaryText ? '10px' : '0'} 0 0 0; word-break:break-all; font-size:13px; line-height:22px; color:#8a6a43;">
                      <a href="${definition.secondaryLinkUrl}" style="color:#8a6a43; text-decoration:underline;">${
                        definition.secondaryLinkLabel || definition.secondaryLinkUrl
                      }</a>
                    </p>
                  `
                  : ''
              }
            </div>
          </td>
        </tr>
      `
      : ''

  const ctaBlock =
    definition.ctaLabel && definition.ctaUrl
      ? `
        <tr>
          <td align="center" style="padding:20px 32px 28px 32px;">
            <a
              href="${definition.ctaUrl}"
              style="display:inline-block; background-color:#c9a97a; color:#111111; text-decoration:none; font-size:15px; font-weight:700; padding:16px 28px; border-radius:999px;"
            >
              ${definition.ctaLabel}
            </a>
          </td>
        </tr>
      `
      : ''

  return `<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${definition.title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f1eb; font-family:Arial, Helvetica, sans-serif; color:#1f1f1f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f1eb; margin:0; padding:0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px; background-color:#ffffff; border-radius:20px; overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg, #111111 0%, #2a2a2a 100%); padding:32px 32px 24px 32px; text-align:center;">
                <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#d7c2a3; margin-bottom:10px;">
                  DOB Milano
                </div>
                <div style="font-size:28px; line-height:36px; font-weight:700; color:#ffffff; margin:0;">
                  ${definition.title}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 32px 12px 32px;">
                <p style="margin:0 0 16px 0; font-size:16px; line-height:26px; color:#1f1f1f;">
                  ${definition.greeting}
                </p>
                ${introHtml}
              </td>
            </tr>

            ${ctaBlock}
            ${metaBlock}
            ${secondaryBlock}

            <tr>
              <td style="padding:24px 32px 12px 32px;">
                <p style="margin:0; font-size:14px; line-height:24px; color:#666666;">
                  ${definition.note || translateString(locale, 'Per qualsiasi dubbio, il team DOB Milano resta a disposizione.')}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 32px 32px; text-align:center;">
                <div style="height:1px; background-color:#ece7df; margin-bottom:20px;"></div>
                ${brandFooter}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

const buildText = (definition: TemplateDefinition, locale: SeedLocale) =>
  [
    definition.greeting.replace(/<[^>]+>/g, ''),
    '',
    ...definition.intro.map((paragraph) => paragraph.replace(/<[^>]+>/g, '')),
    '',
    definition.ctaLabel && definition.ctaUrl ? `${definition.ctaLabel}: ${definition.ctaUrl}` : '',
    ...(definition.metaLines || []),
    '',
    definition.secondaryText || '',
    definition.secondaryLinkUrl || '',
    '',
    definition.note || translateString(locale, 'Per qualsiasi dubbio, il team DOB Milano resta a disposizione.'),
    '',
    'DOB - Department of Beauty',
  ]
    .filter(Boolean)
    .join('\n')

const definitions: Record<string, TemplateDefinition> = {
  'email_verification_requested:customer': {
    subject: 'Conferma il tuo account DOB Milano',
    title: 'Conferma il tuo account',
    greeting: 'Ciao {{user.firstName}} {{user.lastName}},',
    intro: [
      'Grazie per esserti registrato su <strong>DOB Milano</strong>.',
      'Per attivare il tuo account e completare la verifica, clicca sul pulsante qui sotto.',
    ],
    ctaLabel: 'Verifica account',
    ctaUrl: '{{auth.verifyUrl}}',
    secondaryText: 'Se il pulsante non funziona, copia e incolla questo link nel browser:',
    secondaryLinkLabel: '{{auth.verifyUrl}}',
    secondaryLinkUrl: '{{auth.verifyUrl}}',
    note: 'Se non hai creato un account, puoi ignorare questa email.',
  },
  'user_registered:admin': {
    subject: 'Nuovo utente registrato su DOB Milano',
    title: 'Nuovo utente registrato',
    greeting: 'Team DOB,',
    intro: ['Un nuovo account cliente è stato creato sulla piattaforma.'],
    metaLines: [
      'Nome: {{user.fullName}}',
      'Email: {{user.email}}',
      'Ruoli: {{user.roles}}',
    ],
  },
  'user_registered:customer': {
    subject: 'Benvenuto su DOB Milano',
    title: 'Benvenuto su DOB Milano',
    greeting: 'Ciao {{user.fullName}},',
    intro: [
      'Il tuo account <strong>DOB Milano</strong> è stato creato correttamente.',
      'Controlla la tua casella email per completare la verifica dell’account e iniziare a usare tutti i servizi disponibili.',
    ],
    metaLines: ['Email: {{user.email}}'],
  },
  'user_verified:admin': {
    subject: 'Utente verificato su DOB Milano',
    title: 'Utente verificato',
    greeting: 'Team DOB,',
    intro: ["Un cliente ha completato correttamente la verifica dell'account."],
    metaLines: ['Nome: {{user.fullName}}', 'Email: {{user.email}}'],
  },
  'password_reset_requested:admin': {
    subject: 'Reset password richiesto',
    title: 'Reset password richiesto',
    greeting: 'Team DOB,',
    intro: ['È stata richiesta una procedura di reset password.'],
    metaLines: [
      'Email: {{user.email}}',
      'IP: {{auth.ip}}',
      'User agent: {{auth.userAgent}}',
    ],
  },
  'password_reset_requested:customer': {
    subject: 'Reimposta la tua password DOB Milano',
    title: 'Reimposta la tua password',
    greeting: 'Ciao {{user.firstName}} {{user.lastName}},',
    intro: [
      'Abbiamo ricevuto una richiesta per reimpostare la password del tuo account <strong>DOB Milano</strong>.',
      'Per completare l’operazione, clicca sul pulsante qui sotto.',
    ],
    ctaLabel: 'Reimposta password',
    ctaUrl: '{{auth.resetUrl}}',
    secondaryText: 'Se il pulsante non funziona, copia e incolla questo link nel browser:',
    secondaryLinkLabel: '{{auth.resetUrl}}',
    secondaryLinkUrl: '{{auth.resetUrl}}',
    note: 'Se non hai richiesto il reset password, puoi ignorare questa email.',
  },
  'password_reset_completed:admin': {
    subject: 'Reset password completato',
    title: 'Reset password completato',
    greeting: 'Team DOB,',
    intro: ['Un utente ha completato con successo il reset della password.'],
    metaLines: [
      'Email: {{user.email}}',
      'IP: {{auth.ip}}',
      'User agent: {{auth.userAgent}}',
    ],
  },
  'login_success_admin_notice:admin': {
    subject: 'Login riuscito',
    title: 'Login riuscito',
    greeting: 'Team DOB,',
    intro: ['È stato registrato un login riuscito.'],
    metaLines: [
      'Email: {{user.email}}',
      'IP: {{auth.ip}}',
      'User agent: {{auth.userAgent}}',
    ],
  },
  'login_failed_admin_notice:admin': {
    subject: 'Login fallito',
    title: 'Login fallito',
    greeting: 'Team DOB,',
    intro: ['È stato registrato un tentativo di login fallito.'],
    metaLines: [
      'Email: {{user.email}}',
      'IP: {{auth.ip}}',
      'User agent: {{auth.userAgent}}',
      'Dettaglio: {{auth.message}}',
    ],
  },
  'consultation_lead_created:customer': {
    subject: 'Richiesta consulenza ricevuta',
    title: 'Richiesta ricevuta',
    greeting: 'Ciao {{customer.fullName}},',
    intro: [
      'Grazie per aver richiesto una consulenza con <strong>DOB Milano</strong>.',
      'Il nostro team prenderà in carico la richiesta e ti contatterà al più presto.',
    ],
    metaLines: [
      'Email: {{customer.email}}',
      'Telefono: {{customer.phone}}',
      'Skin type: {{consultation.skinType}}',
      'Esigenze: {{consultation.concerns}}',
    ],
  },
  'consultation_lead_created:admin': {
    subject: 'Nuova richiesta consulenza',
    title: 'Nuova richiesta consulenza',
    greeting: 'Team DOB,',
    intro: ['È arrivata una nuova richiesta di consulenza dal sito.'],
    metaLines: [
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Telefono: {{customer.phone}}',
      'Skin type: {{consultation.skinType}}',
      'Esigenze: {{consultation.concerns}}',
      'Messaggio: {{consultation.message}}',
    ],
  },
  'newsletter_service_created:customer': {
    subject: 'Nuovo servizio DOB Milano: {{service.name}}',
    title: 'Nuovo servizio disponibile',
    greeting: 'Ciao {{customer.fullName}},',
    intro: [
      'Abbiamo pubblicato un nuovo servizio su <strong>DOB Milano</strong>.',
      'Scopri i dettagli e prenota direttamente online.',
    ],
    ctaLabel: 'Scopri il servizio',
    ctaUrl: '{{service.url}}',
    metaLines: [
      'Servizio: {{service.name}}',
      'Prezzo: {{service.price}}',
      'Durata: {{service.durationMinutes}} min',
    ],
  },
  'newsletter_service_created:admin': {
    subject: 'Nuovo servizio pubblicato: {{service.name}}',
    title: 'Nuovo servizio pubblicato',
    greeting: 'Team DOB,',
    intro: ['È stato pubblicato un nuovo servizio e il trigger newsletter è stato eseguito.'],
    metaLines: [
      'Servizio: {{service.name}}',
      'Prezzo: {{service.price}}',
      'Durata: {{service.durationMinutes}} min',
      'Link: {{service.url}}',
    ],
  },
  'newsletter_product_created:customer': {
    subject: 'Nuovo prodotto DOB Milano: {{product.title}}',
    title: 'Nuovo prodotto disponibile',
    greeting: 'Ciao {{customer.fullName}},',
    intro: [
      'Abbiamo aggiunto un nuovo prodotto su <strong>DOB Milano</strong>.',
      'Scopri la scheda prodotto completa direttamente sul sito.',
    ],
    ctaLabel: 'Scopri il prodotto',
    ctaUrl: '{{product.url}}',
    metaLines: [
      'Prodotto: {{product.title}}',
      'Brand: {{product.brand}}',
      'Prezzo: {{product.price}}',
    ],
  },
  'newsletter_product_created:admin': {
    subject: 'Nuovo prodotto pubblicato: {{product.title}}',
    title: 'Nuovo prodotto pubblicato',
    greeting: 'Team DOB,',
    intro: ['È stato pubblicato un nuovo prodotto e il trigger newsletter è stato eseguito.'],
    metaLines: [
      'Prodotto: {{product.title}}',
      'Brand: {{product.brand}}',
      'Prezzo: {{product.price}}',
      'Link: {{product.url}}',
    ],
  },
  'order_created:customer': {
    subject: 'Abbiamo ricevuto il tuo ordine {{order.number}}',
    title: 'Ordine ricevuto',
    greeting: 'Ciao {{customer.fullName}},',
    intro: [
      'Abbiamo registrato correttamente il tuo ordine su <strong>DOB Milano</strong>.',
      'Di seguito trovi il riepilogo principale della richiesta.',
    ],
    metaLines: [
      'Numero ordine: {{order.number}}',
      'Totale: {{order.total}}',
      'Modalità carrello: {{order.cartMode}}',
      'Fulfillment: {{order.productFulfillmentMode}}',
      'Appuntamento: {{appointment.date}} {{appointment.time}}',
    ],
  },
  'order_created:admin': {
    subject: 'Nuovo ordine {{order.number}}',
    title: 'Nuovo ordine ricevuto',
    greeting: 'Team DOB,',
    intro: ['È stato creato un nuovo ordine e richiede monitoraggio del checkout.'],
    metaLines: [
      'Numero ordine: {{order.number}}',
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Totale: {{order.total}}',
      'Modalità appuntamento: {{appointment.mode}}',
      'Data appuntamento: {{appointment.date}} {{appointment.time}}',
    ],
  },
  'order_paid:customer': {
    subject: 'Conferma ordine {{order.number}}',
    title: 'Ordine confermato',
    greeting: 'Ciao {{customer.fullName}},',
    intro: [
      'Abbiamo ricevuto correttamente il tuo ordine su <strong>DOB Milano</strong>.',
      'Di seguito trovi il riepilogo principale della conferma.',
    ],
    metaLines: [
      'Numero ordine: {{order.number}}',
      'Totale: {{order.total}}',
      'Modalità carrello: {{order.cartMode}}',
      'Fulfillment: {{order.productFulfillmentMode}}',
    ],
  },
  'order_paid:admin': {
    subject: 'Nuovo ordine pagato {{order.number}}',
    title: 'Nuovo ordine pagato',
    greeting: 'Team DOB,',
    intro: ['È stato registrato un nuovo ordine pagato.'],
    metaLines: [
      'Numero ordine: {{order.number}}',
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Totale: {{order.total}}',
      'Modalità appuntamento: {{appointment.mode}}',
      'Data appuntamento: {{appointment.date}} {{appointment.time}}',
    ],
  },
  'order_payment_failed:admin': {
    subject: 'Pagamento fallito per ordine {{order.number}}',
    title: 'Pagamento fallito',
    greeting: 'Team DOB,',
    intro: ['Un pagamento ordine non è andato a buon fine e richiede verifica.'],
    metaLines: [
      'Numero ordine: {{order.number}}',
      'Email cliente: {{customer.email}}',
      'Totale: {{order.total}}',
      'Motivo: {{payment.reason}}',
    ],
  },
  'order_payment_failed:customer': {
    subject: 'Pagamento non riuscito per ordine {{order.number}}',
    title: 'Pagamento non riuscito',
    greeting: 'Ciao {{customer.fullName}},',
    intro: [
      'Non siamo riusciti a processare il pagamento del tuo ordine.',
      'Ti consigliamo di riprovare oppure contattare il team DOB Milano se il problema persiste.',
    ],
    metaLines: [
      'Numero ordine: {{order.number}}',
      'Totale: {{order.total}}',
      'Motivo: {{payment.reason}}',
    ],
  },
  'order_cancelled:customer': {
    subject: 'Ordine {{order.number}} annullato',
    title: 'Ordine annullato',
    greeting: 'Ciao {{customer.fullName}},',
    intro: [
      'Ti informiamo che il tuo ordine è stato annullato.',
      'Se hai bisogno di supporto, il team DOB Milano è a disposizione.',
    ],
    metaLines: ['Numero ordine: {{order.number}}', 'Totale: {{order.total}}'],
  },
  'order_cancelled:admin': {
    subject: 'Ordine {{order.number}} annullato',
    title: 'Ordine annullato',
    greeting: 'Team DOB,',
    intro: ['Un ordine è stato annullato e va preso in carico dal backoffice.'],
    metaLines: [
      'Numero ordine: {{order.number}}',
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Totale: {{order.total}}',
    ],
  },
  'order_refunded:customer': {
    subject: 'Ordine {{order.number}} rimborsato',
    title: 'Rimborso confermato',
    greeting: 'Ciao {{customer.fullName}},',
    intro: [
      'Il rimborso relativo al tuo ordine è stato registrato correttamente.',
      'La disponibilità dei fondi dipende dai tempi del tuo provider di pagamento.',
    ],
    metaLines: ['Numero ordine: {{order.number}}', 'Totale: {{order.total}}'],
  },
  'order_refunded:admin': {
    subject: 'Ordine {{order.number}} rimborsato',
    title: 'Ordine rimborsato',
    greeting: 'Team DOB,',
    intro: ['È stato registrato un rimborso ordine.'],
    metaLines: [
      'Numero ordine: {{order.number}}',
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Totale: {{order.total}}',
    ],
  },
  'appointment_requested:customer': {
    subject: 'Richiesta appuntamento ricevuta',
    title: 'Richiesta appuntamento ricevuta',
    greeting: 'Ciao {{customer.fullName}},',
    intro: [
      'Abbiamo ricevuto la tua proposta di appuntamento.',
      'Ti ricontatteremo appena la disponibilità sarà confermata.',
    ],
    metaLines: [
      'Ordine: {{order.number}}',
      'Data: {{appointment.date}}',
      'Ora: {{appointment.time}}',
    ],
  },
  'appointment_requested:admin': {
    subject: 'Nuova richiesta appuntamento',
    title: 'Nuova richiesta appuntamento',
    greeting: 'Team DOB,',
    intro: ['Un cliente ha inviato una nuova richiesta di appuntamento.'],
    metaLines: [
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Ordine: {{order.number}}',
      'Data: {{appointment.date}}',
      'Ora: {{appointment.time}}',
    ],
  },
  'appointment_alternative_proposed:customer': {
    subject: 'Nuova proposta appuntamento',
    title: 'Nuova proposta appuntamento',
    greeting: 'Ciao {{customer.fullName}},',
    intro: ['Ti proponiamo una nuova disponibilità per il tuo appuntamento.'],
    metaLines: [
      'Ordine: {{order.number}}',
      'Data: {{appointment.date}}',
      'Ora: {{appointment.time}}',
      'Nota: {{appointment.note}}',
    ],
  },
  'appointment_alternative_proposed:admin': {
    subject: 'Alternativa appuntamento proposta',
    title: 'Alternativa proposta',
    greeting: 'Team DOB,',
    intro: ['È stata registrata una proposta alternativa di appuntamento.'],
    metaLines: [
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Ordine: {{order.number}}',
      'Data: {{appointment.date}}',
      'Ora: {{appointment.time}}',
      'Nota: {{appointment.note}}',
    ],
  },
  'appointment_confirmed:customer': {
    subject: 'Appuntamento confermato',
    title: 'Appuntamento confermato',
    greeting: 'Ciao {{customer.fullName}},',
    intro: ['Il tuo appuntamento è stato confermato dal team DOB Milano.'],
    metaLines: [
      'Ordine: {{order.number}}',
      'Data: {{appointment.date}}',
      'Ora: {{appointment.time}}',
    ],
  },
  'appointment_confirmed:admin': {
    subject: 'Appuntamento confermato',
    title: 'Appuntamento confermato',
    greeting: 'Team DOB,',
    intro: ['È stata registrata una conferma appuntamento.'],
    metaLines: [
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Ordine: {{order.number}}',
      'Data: {{appointment.date}}',
      'Ora: {{appointment.time}}',
    ],
  },
  'appointment_confirmed_by_customer:customer': {
    subject: 'Conferma appuntamento ricevuta',
    title: 'Conferma ricevuta',
    greeting: 'Ciao {{customer.fullName}},',
    intro: ['Abbiamo registrato la tua conferma per l’appuntamento proposto.'],
    metaLines: [
      'Ordine: {{order.number}}',
      'Data: {{appointment.date}}',
      'Ora: {{appointment.time}}',
    ],
  },
  'appointment_confirmed_by_customer:admin': {
    subject: 'Il cliente ha confermato l’appuntamento',
    title: 'Conferma cliente ricevuta',
    greeting: 'Team DOB,',
    intro: ['Il cliente ha confermato l’appuntamento proposto.'],
    metaLines: [
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Ordine: {{order.number}}',
      'Data: {{appointment.date}}',
      'Ora: {{appointment.time}}',
    ],
  },
  'appointment_cancelled:customer': {
    subject: 'Appuntamento annullato',
    title: 'Appuntamento annullato',
    greeting: 'Ciao {{customer.fullName}},',
    intro: ['Il tuo appuntamento è stato annullato.'],
    metaLines: ['Ordine: {{order.number}}'],
  },
  'appointment_cancelled:admin': {
    subject: 'Appuntamento annullato',
    title: 'Appuntamento annullato',
    greeting: 'Team DOB,',
    intro: ['È stato registrato un annullamento appuntamento.'],
    metaLines: [
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Ordine: {{order.number}}',
    ],
  },
  'shipment_created:customer': {
    subject: 'Spedizione creata per il tuo ordine',
    title: 'Spedizione creata',
    greeting: 'Ciao {{customer.fullName}},',
    intro: ['La spedizione del tuo ordine è stata creata.'],
    metaLines: [
      'Ordine: {{order.number}}',
      'Tracking: {{shipping.trackingNumber}}',
    ],
    secondaryText: 'Puoi seguire lo stato della spedizione dal link qui sotto.',
    secondaryLinkLabel: '{{shipping.trackingUrl}}',
    secondaryLinkUrl: '{{shipping.trackingUrl}}',
  },
  'shipment_created:admin': {
    subject: 'Spedizione creata',
    title: 'Spedizione creata',
    greeting: 'Team DOB,',
    intro: ['È stata creata una spedizione in Sendcloud.'],
    metaLines: [
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Ordine: {{order.number}}',
      'Tracking: {{shipping.trackingNumber}}',
    ],
    secondaryLinkLabel: '{{shipping.trackingUrl}}',
    secondaryLinkUrl: '{{shipping.trackingUrl}}',
  },
  'tracking_available:customer': {
    subject: 'Tracking disponibile per il tuo ordine',
    title: 'Tracking disponibile',
    greeting: 'Ciao {{customer.fullName}},',
    intro: ['Il tracking del tuo ordine è ora disponibile.'],
    metaLines: [
      'Ordine: {{order.number}}',
      'Tracking: {{shipping.trackingNumber}}',
    ],
    secondaryText: 'Puoi seguire lo stato della spedizione dal link qui sotto.',
    secondaryLinkLabel: '{{shipping.trackingUrl}}',
    secondaryLinkUrl: '{{shipping.trackingUrl}}',
  },
  'tracking_available:admin': {
    subject: 'Tracking disponibile',
    title: 'Tracking disponibile',
    greeting: 'Team DOB,',
    intro: ['Il tracking di una spedizione è ora disponibile.'],
    metaLines: [
      'Cliente: {{customer.fullName}}',
      'Email: {{customer.email}}',
      'Ordine: {{order.number}}',
      'Tracking: {{shipping.trackingNumber}}',
    ],
    secondaryLinkLabel: '{{shipping.trackingUrl}}',
    secondaryLinkUrl: '{{shipping.trackingUrl}}',
  },
  'email_delivery_failed:admin': {
    subject: 'Errore invio email {{email.eventKey}}',
    title: 'Errore invio email',
    greeting: 'Team DOB,',
    intro: ['Un tentativo di invio email non è andato a buon fine.'],
    metaLines: [
      'Evento: {{email.eventKey}}',
      'Canale: {{email.channel}}',
      'Destinatario: {{email.to}}',
      'Subject: {{email.subject}}',
      'Errore: {{email.errorMessage}}',
    ],
  },
}

const main = async () => {
  const payload = await getPayload({ config })
  const created: string[] = []
  const skipped: string[] = []

  for (const [eventKey, meta] of Object.entries(EMAIL_EVENT_META) as Array<
    [EmailEventKey, (typeof EMAIL_EVENT_META)[EmailEventKey]]
  >) {
    for (const channel of meta.supportedChannels) {
      const key = `${eventKey}:${channel}`
      const definition = definitions[key]
      if (!definition) {
        skipped.push(`${eventKey}:*:${channel} (missing definition)`)
        continue
      }

      for (const locale of meta.supportedLocales as SeedLocale[]) {
        const templateKey = `${eventKey}:${locale}:${channel}`
        const existing = await payload.find({
          collection: 'email-templates',
          overrideAccess: true,
          depth: 0,
          limit: 1,
          where: {
            templateKey: { equals: templateKey },
          },
        })

        if (existing.docs[0]) {
          skipped.push(`${templateKey} (already exists)`)
          continue
        }

        const localizedDefinition = localizeDefinition(definition, locale)

        await payload.create({
          collection: 'email-templates',
          overrideAccess: true,
          data: {
            eventKey,
            locale,
            channel,
            active: true,
            description: meta.description,
            subject: localizedDefinition.subject,
            html: buildHtml(localizedDefinition, locale),
            text: buildText(localizedDefinition, locale),
            availableVariables: meta.availableVariables,
            testDataExample: meta.testDataExample,
          } as never,
        })

        created.push(templateKey)
      }
    }
  }

  console.log(`Created templates: ${created.length}`)
  created.forEach((entry) => console.log(`+ ${entry}`))
  console.log(`Skipped templates: ${skipped.length}`)
  skipped.forEach((entry) => console.log(`- ${entry}`))
}

await main()
