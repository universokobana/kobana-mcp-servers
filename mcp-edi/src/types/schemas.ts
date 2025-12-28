import { z } from 'zod';

// Pagination Schemas

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().describe('Page number (default: 1)'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page (default: 50, max: 50)'),
});

// EDI Box Resource Schema

export const ediBoxResourceSchema = z.object({
  type: z.enum(['charge.bank_billet_account', 'financial.account']).describe('Resource type: charge.bank_billet_account (Billing Wallet) or financial.account (Financial Account)'),
  uid: z.string().describe('UID of the associated resource'),
});

// Account Owner Schema (for create/update)

export const accountOwnerInputSchema = z.object({
  name: z.string().describe('Account owner name'),
  document_number: z.string().describe('Document number (CPF or CNPJ)'),
  phone_number: z.string().describe('Phone number with area code (e.g., 2130030386)'),
  email: z.string().email().describe('Email address'),
});

// Bank Manager Schema (for create/update)

export const bankManagerInputSchema = z.object({
  name: z.string().describe('Bank manager name'),
  phone_number: z.string().describe('Phone number with area code (e.g., 2130030386)'),
  email: z.string().email().describe('Email address'),
});

// Letter Owner Schema (for create/update)

export const letterOwnerInputSchema = z.object({
  name: z.string().describe('Letter owner name'),
  phone_number: z.string().describe('Phone number with area code (e.g., 2130030386)'),
  email: z.string().email().describe('Email address'),
});

// Create EDI Box Schema

export const createEdiBoxSchema = z.object({
  resource: ediBoxResourceSchema.describe('Associated resource (billing wallet or financial account)'),
  name: z.string().optional().describe('Identification name for the EDI box'),
  operation: z.enum(['charge', 'statement', 'payment']).optional().describe('Operation type: charge (Billing), statement (Statement), or payment (Payment)'),
  kind: z.enum(['cnab400', 'cnab240', 'cnab200']).optional().describe('CNAB file format: cnab400, cnab240, or cnab200'),
  account_owner: accountOwnerInputSchema.describe('Account owner information'),
  bank_manager: bankManagerInputSchema.optional().describe('Bank manager information'),
  letter_owner: letterOwnerInputSchema.describe('Letter owner information'),
  business_logo: z.string().optional().describe('Company logo in base64 format (JPG or PNG, max 500KB, 150x150 pixels)'),
});

// Update EDI Box Schema

export const updateEdiBoxSchema = z.object({
  uid: z.string().describe('Unique identifier of the EDI box'),
  resource: ediBoxResourceSchema.optional().describe('Associated resource (billing wallet or financial account)'),
  name: z.string().optional().describe('Identification name for the EDI box'),
  operation: z.enum(['charge', 'statement', 'payment']).optional().describe('Operation type: charge (Billing), statement (Statement), or payment (Payment)'),
  kind: z.enum(['cnab400', 'cnab240', 'cnab200']).optional().describe('CNAB file format: cnab400, cnab240, or cnab200'),
  account_owner: accountOwnerInputSchema.optional().describe('Account owner information'),
  bank_manager: bankManagerInputSchema.optional().describe('Bank manager information'),
  letter_owner: letterOwnerInputSchema.optional().describe('Letter owner information'),
  business_logo: z.string().optional().describe('Company logo in base64 format (JPG or PNG, max 500KB, 150x150 pixels)'),
});

// Get EDI Box Schema

export const getEdiBoxSchema = z.object({
  uid: z.string().describe('Unique identifier of the EDI box'),
});

// List EDI Boxes Schema

export const listEdiBoxesSchema = paginationSchema.extend({
  resource_type: z.string().optional().describe('Filter by resource type: charge.bank_billet_account or financial.account'),
});
