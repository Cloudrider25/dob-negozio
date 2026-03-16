import type { CollectionConfig } from 'payload'

import { getAccountDictionary, resolveLocale } from '@/lib/i18n/account'
import {
  sendAdminUserNotification,
  sendUserRegisteredCustomerNotification,
} from '@/lib/server/email/businessNotifications'
import {
  getEmailDeliveryMode,
  injectEmailEventMarker,
} from '@/lib/server/email/deliveryPolicy'
import { resolveBusinessEventEmailContent } from '@/lib/server/email/sendBusinessEventEmail'
import { getPasswordValidationFailureKey } from '@/lib/shared/auth/passwordPolicy'
import { ensureAnagraficaForCustomer } from '@/lib/server/anagrafiche/ensureAnagraficaForCustomer'
import { getPublicSiteOrigin } from '@/lib/server/url/getPublicSiteOrigin'

import { isAdmin, isAdminField } from '../access/isAdmin'
import { isAdminOrSelf } from '../access/isAdminOrSelf'

const getClientIP = (req: { headers: Headers }) =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  req.headers.get('x-real-ip')?.trim() ||
  ''

const getUserPreferredLocale = (user: unknown) =>
  typeof user === 'object' &&
  user &&
  'preferences' in user &&
  typeof user.preferences === 'object' &&
  user.preferences &&
  'preferredLocale' in user.preferences &&
  typeof user.preferences.preferredLocale === 'string'
    ? resolveLocale(user.preferences.preferredLocale)
    : 'it'

const getPreferredRequestLocale = (req: { headers: Headers; locale?: unknown }, data?: Record<string, unknown>) => {
  if (typeof req.locale === 'string') {
    return resolveLocale(req.locale)
  }

  const preferredLocale =
    data &&
    'preferences' in data &&
    typeof data.preferences === 'object' &&
    data.preferences &&
    'preferredLocale' in data.preferences &&
    typeof data.preferences.preferredLocale === 'string'
      ? data.preferences.preferredLocale
      : undefined

  if (preferredLocale) {
    return resolveLocale(preferredLocale)
  }

  const acceptLanguage = req.headers.get('accept-language')?.split(',')[0]?.trim()
  if (acceptLanguage) {
    return resolveLocale(acceptLanguage.split('-')[0] ?? acceptLanguage)
  }

  return 'it'
}

const getRequestedRedirect = (req: { data?: Record<string, unknown> }) => {
  const redirect =
    req.data && typeof req.data.redirect === 'string'
      ? req.data.redirect.trim()
      : ''

  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return null
  }

  return redirect
}

const getPasswordValidationMessage = (
  locale: ReturnType<typeof resolveLocale>,
  requirementKey: NonNullable<ReturnType<typeof getPasswordValidationFailureKey>>,
) => {
  const copy = getAccountDictionary(locale).auth.signUp
  return `${copy.feedback.passwordInvalidTitle}. ${copy.passwordStatusMissingPrefix} ${copy.passwordRequirements[requirementKey]}.`
}

const getVerificationEmailFallback = ({
  locale,
  url,
  firstName,
}: {
  locale: ReturnType<typeof resolveLocale>
  url: string
  firstName: string
}) => {
  const copy = getAccountDictionary(locale).authEmail.verify
  const greetingLine =
    firstName.length > 0 ? `${copy.greeting} ${firstName},` : `${copy.greeting},`

  return {
    subject: copy.subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <p>${greetingLine}</p>
        <p>${copy.intro}</p>
        <p><a href="${url}">${copy.ctaLabel}</a></p>
        <p>${copy.outro}</p>
      </div>
    `,
  }
}

const getResetPasswordEmailFallback = ({
  locale,
  url,
  firstName,
}: {
  locale: ReturnType<typeof resolveLocale>
  url: string
  firstName: string
}) => {
  const copy = getAccountDictionary(locale).authEmail.resetPassword
  const greetingLine =
    firstName.length > 0 ? `${copy.greeting} ${firstName},` : `${copy.greeting},`

  return {
    subject: copy.subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <p>${greetingLine}</p>
        <p>${copy.intro}</p>
        <p><a href="${url}">${copy.ctaLabel}</a></p>
        <p>${copy.outro}</p>
      </div>
    `,
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Impostazioni',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    forgotPassword: {
      expiration: 1000 * 60 * 30,
      generateEmailSubject: async ({ req, token, user } = {}) => {
        const origin = getPublicSiteOrigin(req?.headers)
        const locale = getUserPreferredLocale(user)
        const url = `${origin}/${locale}/reset-password?token=${encodeURIComponent(token || '')}`
        const firstName =
          typeof user === 'object' &&
          user &&
          'firstName' in user &&
          typeof user.firstName === 'string' &&
          user.firstName.trim().length > 0
            ? user.firstName.trim()
            : ''
        const lastName =
          typeof user === 'object' &&
          user &&
          'lastName' in user &&
          typeof user.lastName === 'string' &&
          user.lastName.trim().length > 0
            ? user.lastName.trim()
            : ''
        const email =
          typeof user === 'object' &&
          user &&
          'email' in user &&
          typeof user.email === 'string'
            ? user.email.trim()
            : ''

        const fallback = getResetPasswordEmailFallback({
          locale,
          url,
          firstName,
        })

        if (!req) {
          return fallback.subject
        }

        const deliveryMode = await getEmailDeliveryMode({
          payload: req.payload,
          req,
          eventKey: 'password_reset_requested',
          locale,
        })

        const content = await resolveBusinessEventEmailContent({
          payload: req.payload,
          req,
          eventKey: 'password_reset_requested',
          channel: 'customer',
          locale,
          data: {
            user: {
              firstName,
              lastName,
              fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
              email,
            },
            auth: {
              resetUrl: url,
            },
          },
          fallback,
          deliveryMode: deliveryMode === 'disabled' ? undefined : deliveryMode,
        })

        return content?.subject || fallback.subject
      },
      generateEmailHTML: async ({ req, token, user } = {}) => {
        const origin = getPublicSiteOrigin(req?.headers)
        const locale = getUserPreferredLocale(user)
        const url = `${origin}/${locale}/reset-password?token=${encodeURIComponent(token || '')}`
        const firstName =
          typeof user === 'object' &&
          user &&
          'firstName' in user &&
          typeof user.firstName === 'string' &&
          user.firstName.trim().length > 0
            ? user.firstName.trim()
            : ''
        const lastName =
          typeof user === 'object' &&
          user &&
          'lastName' in user &&
          typeof user.lastName === 'string' &&
          user.lastName.trim().length > 0
            ? user.lastName.trim()
            : ''
        const email =
          typeof user === 'object' &&
          user &&
          'email' in user &&
          typeof user.email === 'string'
            ? user.email.trim()
            : ''

        const fallback = getResetPasswordEmailFallback({
          locale,
          url,
          firstName,
        })

        if (!req) {
          return fallback.html
        }

        const deliveryMode = await getEmailDeliveryMode({
          payload: req.payload,
          req,
          eventKey: 'password_reset_requested',
          locale,
        })

        const content = await resolveBusinessEventEmailContent({
          payload: req.payload,
          req,
          eventKey: 'password_reset_requested',
          channel: 'customer',
          locale,
          data: {
            user: {
              firstName,
              lastName,
              fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
              email,
            },
            auth: {
              resetUrl: url,
            },
          },
          fallback,
          deliveryMode: deliveryMode === 'disabled' ? undefined : deliveryMode,
        })

        return injectEmailEventMarker(
          content?.html || fallback.html,
          'password_reset_requested',
          locale,
        )
      },
    },
    verify: {
      generateEmailSubject: async ({ req, token, user }) => {
        const origin = getPublicSiteOrigin(req.headers)
        const locale = getUserPreferredLocale(user)
        const redirect = getRequestedRedirect(req)
        const url = `${origin}/${locale}/verify-email?token=${encodeURIComponent(token)}${
          redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''
        }`
        const firstName =
          typeof user === 'object' &&
          user &&
          'firstName' in user &&
          typeof user.firstName === 'string' &&
          user.firstName.trim().length > 0
            ? user.firstName.trim()
            : ''
        const lastName =
          typeof user === 'object' &&
          user &&
          'lastName' in user &&
          typeof user.lastName === 'string' &&
          user.lastName.trim().length > 0
            ? user.lastName.trim()
            : ''
        const email =
          typeof user === 'object' &&
          user &&
          'email' in user &&
          typeof user.email === 'string'
            ? user.email.trim()
            : ''

        const fallback = getVerificationEmailFallback({
          locale,
          url,
          firstName,
        })

        const deliveryMode = await getEmailDeliveryMode({
          payload: req.payload,
          req,
          eventKey: 'email_verification_requested',
          locale,
        })

        const content = await resolveBusinessEventEmailContent({
          payload: req.payload,
          req,
          eventKey: 'email_verification_requested',
          channel: 'customer',
          locale,
          data: {
            user: {
              firstName,
              lastName,
              fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
              email,
            },
            auth: {
              verifyUrl: url,
            },
          },
          fallback,
          deliveryMode: deliveryMode === 'disabled' ? undefined : deliveryMode,
        })

        return content?.subject || fallback.subject
      },
      generateEmailHTML: async ({ req, token, user }) => {
        const origin = getPublicSiteOrigin(req.headers)
        const locale = getUserPreferredLocale(user)
        const redirect = getRequestedRedirect(req)
        const url = `${origin}/${locale}/verify-email?token=${encodeURIComponent(token)}${
          redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''
        }`
        const firstName =
          typeof user === 'object' &&
          user &&
          'firstName' in user &&
          typeof user.firstName === 'string' &&
          user.firstName.trim().length > 0
            ? user.firstName.trim()
            : ''
        const lastName =
          typeof user === 'object' &&
          user &&
          'lastName' in user &&
          typeof user.lastName === 'string' &&
          user.lastName.trim().length > 0
            ? user.lastName.trim()
            : ''
        const email =
          typeof user === 'object' &&
          user &&
          'email' in user &&
          typeof user.email === 'string'
            ? user.email.trim()
            : ''

        const fallback = getVerificationEmailFallback({
          locale,
          url,
          firstName,
        })

        const deliveryMode = await getEmailDeliveryMode({
          payload: req.payload,
          req,
          eventKey: 'email_verification_requested',
          locale,
        })

        const content = await resolveBusinessEventEmailContent({
          payload: req.payload,
          req,
          eventKey: 'email_verification_requested',
          channel: 'customer',
          locale,
          data: {
            user: {
              firstName,
              lastName,
              fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
              email,
            },
            auth: {
              verifyUrl: url,
            },
          },
          fallback,
          deliveryMode: deliveryMode === 'disabled' ? undefined : deliveryMode,
        })

        return injectEmailEventMarker(
          content?.html || fallback.html,
          'email_verification_requested',
          locale,
        )
      },
    },
  },
  access: {
    read: isAdminOrSelf,
    create: ({ req }) => {
      if (!req.user) return true
      return isAdmin({ req })
    },
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        await req.payload.create({
          collection: 'auth-audit-events',
          overrideAccess: true,
          req,
          data: {
            eventType: 'login_success',
            success: true,
            email: typeof user?.email === 'string' ? user.email : undefined,
            user: typeof user?.id === 'number' ? user.id : undefined,
            ip: getClientIP(req),
            userAgent: req.headers.get('user-agent') || undefined,
            message: 'Login successful.',
          },
        })
      },
    ],
    afterOperation: [
      async ({ operation, req, args, result }) => {
        if (operation === 'forgotPassword') {
          await req.payload.create({
            collection: 'auth-audit-events',
            overrideAccess: true,
            req,
            data: {
              eventType: 'forgot_password',
              success: true,
              email:
                typeof args === 'object' &&
                args &&
                'email' in args &&
                typeof args.email === 'string'
                  ? args.email
                  : undefined,
              ip: getClientIP(req),
              userAgent: req.headers.get('user-agent') || undefined,
              message: 'Password reset email requested.',
            },
          })
          return result
        }

        if (operation !== 'resetPassword') return result

        const email =
          typeof result === 'object' &&
          result &&
          'user' in result &&
          result.user &&
          typeof result.user === 'object' &&
          'email' in result.user &&
          typeof result.user.email === 'string'
            ? result.user.email
            : typeof args === 'object' && args && 'token' in args
              ? 'unknown'
              : undefined

        await req.payload.create({
          collection: 'auth-audit-events',
          overrideAccess: true,
          req,
          data: {
            eventType: 'reset_password',
            success: true,
            email,
            ip: getClientIP(req),
            userAgent: req.headers.get('user-agent') || undefined,
            message: 'Password reset completed.',
          },
        })

        return result
      },
    ],
    afterChange: [
      async ({ doc, req, context, operation, previousDoc }) => {
        if (context?.skipAnagraficaSync) return
        await ensureAnagraficaForCustomer(req.payload, doc, { req })

        const email = typeof doc?.email === 'string' ? doc.email.trim() : ''
        if (!email) return

        if (operation === 'create') {
          await sendUserRegisteredCustomerNotification({
            payload: req.payload,
            req,
            eventKey: 'user_registered',
            firstName: typeof doc?.firstName === 'string' ? doc.firstName : '',
            lastName: typeof doc?.lastName === 'string' ? doc.lastName : '',
            email,
            roles: Array.isArray(doc?.roles)
              ? doc.roles.filter((role: unknown): role is string => typeof role === 'string')
              : [],
          })
          await sendAdminUserNotification({
            payload: req.payload,
            req,
            eventKey: 'user_registered',
            firstName: typeof doc?.firstName === 'string' ? doc.firstName : '',
            lastName: typeof doc?.lastName === 'string' ? doc.lastName : '',
            email,
            roles: Array.isArray(doc?.roles)
              ? doc.roles.filter((role: unknown): role is string => typeof role === 'string')
              : [],
          })
          return
        }

        if (previousDoc?._verified !== true && doc?._verified === true) {
          await sendAdminUserNotification({
            payload: req.payload,
            req,
            eventKey: 'user_verified',
            firstName: typeof doc?.firstName === 'string' ? doc.firstName : '',
            lastName: typeof doc?.lastName === 'string' ? doc.lastName : '',
            email,
            roles: Array.isArray(doc?.roles)
              ? doc.roles.filter((role: unknown): role is string => typeof role === 'string')
              : [],
          })
        }
      },
    ],
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (!data) return data

        // Protect role assignment for public signup and bootstrap first user as admin.
        if (operation === 'create' && !req.user) {
          const users = await req.payload.find({
            collection: 'users',
            limit: 1,
            overrideAccess: true,
          })

          data.roles = users.totalDocs === 0 ? ['admin'] : ['customer']
        }

        if (typeof data.password === 'string' && data.password.length > 0) {
          const passwordFailureKey = getPasswordValidationFailureKey(data.password)
          if (passwordFailureKey) {
            const locale = getPreferredRequestLocale(req, data)
            throw new Error(getPasswordValidationMessage(locale, passwordFailureKey))
          }
        }

        return data
      },
    ],
  },
  fields: [
    // Email added by default
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'roles',
              type: 'select',
              hasMany: true,
              options: ['admin', 'editor', 'customer', 'partner'],
              defaultValue: ['customer'],
              required: true,
              saveToJWT: true,
              access: {
                create: isAdminField,
                update: isAdminField,
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'firstName',
                  type: 'text',
                },
                {
                  name: 'lastName',
                  type: 'text',
                },
              ],
            },
            {
              name: 'phone',
              type: 'text',
            },
          ],
        },
        {
          label: 'Addresses',
          fields: [
            {
              name: 'addresses',
              type: 'array',
              labels: {
                singular: 'Indirizzo',
                plural: 'Indirizzi',
              },
              fields: [
                { name: 'firstName', type: 'text' },
                { name: 'lastName', type: 'text' },
                { name: 'company', type: 'text' },
                { name: 'streetAddress', type: 'text' },
                { name: 'apartment', type: 'text' },
                { name: 'city', type: 'text' },
                { name: 'country', type: 'text' },
                { name: 'province', type: 'text' },
                { name: 'postalCode', type: 'text' },
                { name: 'phone', type: 'text' },
                { name: 'isDefault', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
        {
          label: 'Preferences',
          fields: [
            {
              name: 'preferences',
              type: 'group',
              fields: [
                {
                  name: 'marketingOptIn',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'preferredLocale',
                  type: 'select',
                  defaultValue: 'it',
                  options: ['it', 'en', 'ru'],
                },
              ],
            },
          ],
        },
        {
          label: 'Partner',
          admin: {
            condition: (data) =>
              Array.isArray(data?.roles) && data.roles.some((role: unknown) => role === 'partner'),
          },
          fields: [
            {
              name: 'partnerCommissionDashboard',
              type: 'ui',
              admin: {
                components: {
                  Field: '/admin/components/PartnerCommissionDashboard',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
