// @ts-check

/**
 * @fileoverview Common defines.
 * @description
 */

/**
 * @class Constants
 * @classdesc Central container for constant defines.
 */
class Constants {
    // Folders
    FOLDER = {
        LOGS: 'logs',
        NOTES: 'notes',
        ARCHIVES: 'archives',
        ATTACHMENTS: 'attachments'
    }

    // General properties
    PROPERTY = {
        TAGS: 'tags',
        RELATES_TO: 'relates_to',
        STATUS: 'status',
        NOTES: 'notes',
        // Log-specific properties
        LOG: {
            TYPE: 'log_type',
            VALUE: 'log_value'
        },
        COST: {
            COST: 'cost',
            INCOME: 'cost_income',
            PER: 'cost_per',
            ACCOUNT: 'cost_account'
        }
    }

    // Property Values
    VALUE = {
        // Log-Types
        LOG_TYPE: {
            WORTH: 'worth'
        },
        STATUS: {
            ACTIVE: 'active'
        }
    }
}
