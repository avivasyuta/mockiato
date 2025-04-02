import { HttpMethodType, TMock, TMockGroup } from '~/types';
import { z, ZodError } from 'zod';

const groupSchema = z.object({
    id: z.string(),
    name: z.string(),
});

const mockSchema = z.object({
    id: z.string(),
    url: z.string(),
    urlType: z.enum(['url', 'regexp']),
    httpMethod: z.nativeEnum(HttpMethodType),
    httpStatusCode: z.number(),
    delay: z.number(),
    responseType: z.enum(['text', 'json', 'none']),
    isActive: z.boolean(),
    responseHeaders: z.array(
        z.object({
            id: z.string(),
            key: z.string(),
            value: z.string(),
        }),
    ),
    response: z.string().optional(),
    comment: z.string().optional(),
    groupId: z.string().optional(),
});

const parsedDataSchema = z.object({
    mocks: z.array(mockSchema),
    groups: z.array(groupSchema),
});

export type ParsedData = {
    mocks: TMock[];
    groups: TMockGroup[];
};

export type ValidationResult = {
    parsed: ParsedData | null;
    errors: string[] | null;
};

function validateMocks(mocks: TMock[], groups: TMockGroup[]): string[] {
    const errors: string[] = [];
    const groupsIdsSet = new Set<string>();

    groups.forEach((group) => groupsIdsSet.add(group.id));

    mocks.forEach((mock) => {
        if (mock.groupId && !groupsIdsSet.has(mock.groupId)) {
            errors.push(`Mock [${mock.id}] has invalid group id [${mock.groupId}]`);
        }
    });

    return errors;
}

export function validateGroups(groups: TMockGroup[]): string[] {
    const frequencyByGroupId = new Map<string, number>();

    groups.forEach((group) => {
        const current = frequencyByGroupId.get(group.id) ?? 0;
        frequencyByGroupId.set(group.id, current + 1);
    });

    const errors: string[] = [];
    frequencyByGroupId.forEach((count, id) => {
        if (count > 1) {
            errors.push(`There ${count} groups with duplicated id [${id}]`);
        }
    });

    return errors;
}

export function parseMocks(data: string): ValidationResult {
    try {
        const parsed: ParsedData = parsedDataSchema.parse(JSON.parse(data));

        const groupsErrors = validateGroups(parsed.groups);
        const mocksErrors = validateMocks(parsed.mocks, parsed.groups);

        if (groupsErrors.length > 0 || mocksErrors.length > 0) {
            return {
                errors: [...mocksErrors, ...groupsErrors],
                parsed: null,
            };
        }

        return {
            parsed,
            errors: null,
        };
    } catch (e) {
        const errors: string[] = [];

        if (e instanceof ZodError) {
            e.errors.forEach((issue) => {
                errors.push(`Field path: [${issue.path}], Message: ${issue.message}`);
            });
        } else {
            // необязательная обработка других типов ошибок
            errors.push(`Error: ${e}`);
        }

        return {
            errors,
            parsed: null,
        };
    }
}
