import { z } from 'zod';

// Pagination Schemas

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().describe('Page number (default: 1)'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page (default: 50, max: 50)'),
});

// User Schemas

export const createUserSchema = z.object({
  email: z.string().email().describe('User email address'),
  first_name: z.string().optional().nullable().describe('First name'),
  middle_name: z.string().optional().nullable().describe('Middle name'),
  last_name: z.string().optional().nullable().describe('Last name'),
  permissions: z.array(z.string()).optional().nullable().describe('Array of permission slugs (e.g., admin.user.*, charge.pix.*)'),
});

export const updateUserSchema = z.object({
  id: z.number().int().positive().describe('User ID'),
  email: z.string().email().optional().describe('User email address'),
  first_name: z.string().optional().nullable().describe('First name'),
  middle_name: z.string().optional().nullable().describe('Middle name'),
  last_name: z.string().optional().nullable().describe('Last name'),
  permissions: z.array(z.string()).optional().nullable().describe('Array of permission slugs'),
});

export const getUserSchema = z.object({
  id: z.number().int().positive().describe('User ID'),
});

export const deleteUserSchema = z.object({
  id: z.number().int().positive().describe('User ID'),
});

export const listUsersSchema = paginationSchema.extend({
  email: z.string().optional().describe('Filter by email'),
});

// Subaccount Schemas

export const createSubaccountSchema = z.object({
  nickname: z.string().describe('Subaccount nickname (required)'),
  email: z.string().email().optional().describe('Email address'),
  business_name: z.string().optional().nullable().describe('Business name (nome fantasia)'),
  business_cnpj: z.string().optional().nullable().describe('CNPJ of the business'),
  business_legal_name: z.string().optional().nullable().describe('Legal name (razao social)'),
  external_id: z.string().optional().nullable().describe('External ID for your system'),
  custom_data: z.record(z.unknown()).optional().nullable().describe('Custom JSON data'),
  tags: z.array(z.string()).optional().nullable().describe('Tags for categorization'),
});

export const updateSubaccountSchema = z.object({
  id: z.number().int().positive().describe('Subaccount ID'),
  nickname: z.string().optional().describe('Subaccount nickname'),
  email: z.string().email().optional().describe('Email address'),
  business_cnpj: z.string().optional().nullable().describe('CNPJ of the business'),
  business_legal_name: z.string().optional().nullable().describe('Legal name (razao social)'),
  account_type: z.enum(['individual', 'juridical']).optional().describe('Account type: individual (pessoa fisica) or juridical (pessoa juridica)'),
  first_name: z.string().optional().nullable().describe('First name of responsible person'),
  middle_name: z.string().optional().nullable().describe('Middle name of responsible person'),
  last_name: z.string().optional().nullable().describe('Last name of responsible person'),
  gender: z.string().optional().nullable().describe('Gender'),
  cpf: z.string().optional().nullable().describe('CPF'),
  address_street_name: z.string().optional().nullable().describe('Street name'),
  address_number: z.string().optional().nullable().describe('Address number'),
  address_complement: z.string().optional().nullable().describe('Address complement'),
  address_neighborhood: z.string().optional().nullable().describe('Neighborhood'),
  address_city_name: z.string().optional().nullable().describe('City name'),
  address_state: z.string().optional().nullable().describe('State (2 letters, e.g., SP)'),
  address_zipcode: z.string().optional().nullable().describe('ZIP code'),
  phone_number: z.string().optional().nullable().describe('Phone number'),
  mobile_number: z.string().optional().nullable().describe('Mobile number'),
  external_id: z.string().optional().nullable().describe('External ID for your system'),
  custom_data: z.record(z.unknown()).optional().nullable().describe('Custom JSON data'),
  tags: z.array(z.string()).optional().nullable().describe('Tags for categorization'),
});

export const getSubaccountSchema = z.object({
  id: z.number().int().positive().describe('Subaccount ID'),
});

export const listSubaccountsSchema = paginationSchema.extend({
  email: z.string().optional().describe('Filter by email'),
  business_cnpj: z.string().optional().describe('Filter by CNPJ'),
  created_from: z.string().optional().describe('Filter by minimum creation date (ISO 8601)'),
  created_to: z.string().optional().describe('Filter by maximum creation date (ISO 8601)'),
});

// Certificate Schemas

export const createCertificateSchema = z.object({
  label: z.string().describe('Certificate label/name'),
  cnpj_cpf: z.string().describe('CPF or CNPJ associated with the certificate'),
  subaccounts: z.boolean().optional().nullable().describe('Whether certificate is available for subaccounts'),
  type: z.enum(['crt', 'pfx']).describe('Certificate type: crt or pfx'),
  files: z.object({
    crt_file: z.string().optional().describe('Base64 encoded .cer/.crt file (required for type=crt)'),
    crt_private_key_file: z.string().optional().describe('Base64 encoded .key file (required for type=crt)'),
    pfx_file: z.string().optional().describe('Base64 encoded .p12/.pfx file (required for type=pfx)'),
    pfx_password: z.string().optional().describe('Password for PFX certificate (required for type=pfx)'),
  }).describe('Certificate files'),
});

export const getCertificateSchema = z.object({
  uid: z.string().describe('Certificate UID'),
});

export const listCertificatesSchema = paginationSchema;

// Connection Schemas

const associationSchema = z.object({
  resource: z.object({
    slug: z.enum(['charge.bank_billet_account', 'charge.pix_account']).describe('Service account type'),
    uid: z.string().describe('Service account UID'),
  }),
});

export const createConnectionSchema = z.object({
  label: z.string().optional().nullable().describe('Connection label/name'),
  provider_slug: z.string().describe('Financial provider slug (e.g., banco_do_brasil, itau, bradesco)'),
  environment: z.enum(['production', 'homologation']).optional().describe('Environment: production or homologation'),
  enabled: z.boolean().optional().nullable().describe('Enable connection'),
  apis: z.array(z.string()).optional().describe('Allowed APIs (e.g., charge/bank_billet, charge/pix)'),
  credentials: z.record(z.unknown()).describe('Provider credentials (varies by provider)'),
  certificate_uid: z.string().optional().nullable().describe('Certificate UID if required'),
  associations: z.array(associationSchema).optional().describe('Service accounts to associate'),
});

export const updateConnectionSchema = z.object({
  uid: z.string().describe('Connection UID'),
  label: z.string().optional().nullable().describe('Connection label/name'),
  environment: z.enum(['production', 'homologation']).optional().describe('Environment: production or homologation'),
  apis: z.array(z.string()).optional().describe('Allowed APIs'),
  credentials: z.record(z.unknown()).optional().describe('Provider credentials'),
  certificate_uid: z.string().optional().nullable().describe('Certificate UID'),
  enabled: z.boolean().optional().nullable().describe('Enable/disable connection'),
  revalidate: z.boolean().optional().nullable().describe('Revalidate credentials with provider'),
});

export const getConnectionSchema = z.object({
  uid: z.string().describe('Connection UID'),
});

export const deleteConnectionSchema = z.object({
  uid: z.string().describe('Connection UID'),
});

export const listConnectionsSchema = paginationSchema.extend({
  provider_slug: z.string().optional().describe('Filter by provider slug'),
  certificate_uid: z.string().optional().describe('Filter by certificate UID'),
  enabled: z.boolean().optional().describe('Filter by enabled status'),
  validated: z.boolean().optional().describe('Filter by validated status'),
  created_from: z.string().optional().describe('Filter by minimum creation date (ISO 8601)'),
  created_to: z.string().optional().describe('Filter by maximum creation date (ISO 8601)'),
});

// Association Schemas

export const createAssociationSchema = z.object({
  connection_uid: z.string().describe('Connection UID'),
  resource: z.object({
    slug: z.enum(['charge.bank_billet_account', 'charge.pix_account']).describe('Service account type: charge.bank_billet_account or charge.pix_account'),
    uid: z.string().describe('Service account UID'),
  }).describe('Service account to associate'),
});

export const deleteAssociationSchema = z.object({
  connection_uid: z.string().describe('Connection UID'),
  resource: z.object({
    slug: z.enum(['charge.bank_billet_account', 'charge.pix_account']).describe('Service account type'),
    uid: z.string().describe('Service account UID'),
  }).describe('Service account to disassociate'),
});
