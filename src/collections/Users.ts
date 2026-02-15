import type { CollectionConfig } from 'payload'

import { getAccountDictionary, resolveLocale } from '@/lib/account-i18n'

import { isAdmin, isAdminField } from '../access/isAdmin'
import { isAdminOrSelf } from '../access/isAdminOrSelf'

const PASSWORD_MIN_LENGTH = 10

const validatePasswordStrength = (password: string) => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La password deve avere almeno ${PASSWORD_MIN_LENGTH} caratteri.`
  }
  if (!/[a-z]/.test(password)) return 'La password deve contenere almeno una lettera minuscola.'
  if (!/[A-Z]/.test(password)) return 'La password deve contenere almeno una lettera maiuscola.'
  if (!/[0-9]/.test(password)) return 'La password deve contenere almeno un numero.'
  if (!/[^A-Za-z0-9]/.test(password))
    return 'La password deve contenere almeno un carattere speciale.'
  return null
}

const getClientIP = (req: { headers: Headers }) =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  req.headers.get('x-real-ip')?.trim() ||
  ''

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Sistema',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    forgotPassword: {
      expiration: 1000 * 60 * 30,
    },
    verify: {
      generateEmailSubject: ({ user }) => {
        const preferredLocale =
          typeof user === 'object' &&
          user &&
          'preferences' in user &&
          typeof user.preferences === 'object' &&
          user.preferences &&
          'preferredLocale' in user.preferences &&
          typeof user.preferences.preferredLocale === 'string'
            ? user.preferences.preferredLocale
            : 'it'
        return getAccountDictionary(resolveLocale(preferredLocale)).authEmail.verify.subject
      },
      generateEmailHTML: ({ req, token, user }) => {
        const origin =
          req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const preferredLocale =
          typeof user === 'object' &&
          user &&
          'preferences' in user &&
          typeof user.preferences === 'object' &&
          user.preferences &&
          'preferredLocale' in user.preferences &&
          typeof user.preferences.preferredLocale === 'string'
            ? user.preferences.preferredLocale
            : 'it'
        const locale = resolveLocale(preferredLocale)
        const copy = getAccountDictionary(locale).authEmail.verify
        const url = `${origin}/${locale}/verify-email?token=${encodeURIComponent(token)}`
        const firstName =
          typeof user === 'object' &&
          user &&
          'firstName' in user &&
          typeof user.firstName === 'string' &&
          user.firstName.trim().length > 0
            ? user.firstName.trim()
            : ''
        const greetingLine =
          firstName.length > 0 ? `${copy.greeting} ${firstName},` : `${copy.greeting},`

        return `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
            <p>${greetingLine}</p>
            <p>${copy.intro}</p>
            <p><a href="${url}">${copy.ctaLabel}</a></p>
            <p>${copy.outro}</p>
          </div>
        `
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
          const passwordError = validatePasswordStrength(data.password)
          if (passwordError) {
            throw new Error(passwordError)
          }
        }

        return data
      },
    ],
  },
  fields: [
    // Email added by default
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'customer'],
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
}
