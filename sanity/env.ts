export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-01'

export const dataset = assertValue(
 "production",
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  "laihzzfy",
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

export const token = assertValue(
  "sk2FGVhhU1nTO0gBUfFHPzdq8quuQcy0K7N4CY4FAGYwcOYWyvZKHaslDd6CXVLJ9qL5mTMTJ0JaKyojVPFrbtnvcnThM6j7qjJgb7BbjZvTaq0h2X5kb7HHsK6jRyUb5VxAZ4GCgCWwQSzrlNPf9jpki8SZr8SC3x9lhEDwOMh9TFuktbIr",
  'Missing environment variable: NEXT_API_TOKEN'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
