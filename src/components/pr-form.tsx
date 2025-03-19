import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCallback, useMemo } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { ClipboardCopy, Sparkles } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { toast } from 'sonner'
import { UnreachableCaseError } from 'ts-essentials'
import { CodeEditor } from '@/components/ui/code-editor'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  org: z.string(),
  repo: z.string(),
  baseBranch: z.string(),
  headBranch: z.string(),
  title: z.string(),
  mode: z.enum(['template', 'body']),
  template: z.string(),
  body: z.string(),
})

export const PrForm = () => {
  const [, copyToClipboard] = useCopyToClipboard()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      org: '',
      repo: '',
      baseBranch: '',
      headBranch: '',
      title: '',
      mode: 'body',
      template: '',
      body: '',
    },
  })

  const formValues = form.watch()
  const { mode } = formValues

  const url = useMemo(() => {
    const { org, repo, baseBranch, headBranch } = formValues

    if (org === '' || repo === '' || baseBranch === '' || headBranch === '') {
      return null
    }

    const url = new URL(
      `https://github.com/${org}/${repo}/compare/${baseBranch}...${headBranch}`,
    )
    const params = new URLSearchParams()

    params.set('expand', '1')

    if (formValues.title !== '') {
      params.set('title', formValues.title)
    }

    if (formValues.mode === 'template') {
      if (formValues.template !== '') {
        params.set('template', formValues.template)
      }
    } else if (formValues.mode === 'body') {
      if (formValues.body !== '') {
        params.set('body', formValues.body)
      }
    } else {
      throw new UnreachableCaseError(formValues.mode)
    }

    url.search = params.toString()

    return url.toString()
  }, [formValues])

  const handleCopy = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    async (e) => {
      e.preventDefault()

      if (url == null) {
        return
      }

      try {
        await copyToClipboard(url)
        toast.success('Pull request URL copied to clipboard !')
      } catch (error) {
        console.error(error)
        toast.error(
          'Failed copying to clipboard. Please copy manually from the result field.',
        )
      }
    },
    [url, copyToClipboard],
  )

  return (
    <div className="flex flex-col gap-8">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Github PR url generator
      </h2>

      <Form {...form}>
        <form className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
          <FormField
            control={form.control}
            name="org"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Organization / Username
                  <span className="text-destructive">*</span>
                </FormLabel>

                <FormControl>
                  <Input placeholder="colinhacks" {...field} />
                </FormControl>

                <FormDescription>
                  Organization or username on GitHub.
                  <br />
                  <code className="text-[0.95em]">
                    https://github.com/
                    <span className="text-foreground">colinhacks</span>/zod
                  </code>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Repository
                  <span className="text-destructive">*</span>
                </FormLabel>

                <FormControl>
                  <Input placeholder="zod" {...field} />
                </FormControl>

                <FormDescription>
                  Repository name on GitHub.
                  <br />
                  <code className="text-[0.95em]">
                    https://github.com/colinhacks/
                    <span className="text-foreground">zod</span>
                  </code>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="baseBranch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Base Branch
                  <span className="text-destructive">*</span>
                </FormLabel>

                <FormControl>
                  <Input placeholder="main" {...field} />
                </FormControl>

                <FormDescription>
                  The branch you want to merge{' '}
                  <span className="text-foreground">into</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="headBranch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Head Branch
                  <span className="text-destructive">*</span>
                </FormLabel>

                <FormControl>
                  <Input placeholder="dev" {...field} />
                </FormControl>

                <FormDescription>
                  The branch you want to merge{' '}
                  <span className="text-foreground">from</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>PR title</FormLabel>

                <FormControl>
                  <Input placeholder="Add a new feature" {...field} />
                </FormControl>

                <FormDescription>Title of the pull request.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start gap-3">
                <FormLabel>Mode</FormLabel>

                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="template" />
                      </FormControl>

                      <FormLabel className="font-normal">Template</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="body" />
                      </FormControl>

                      <FormLabel className="font-normal">Body</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'template' ? (
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Template file</FormLabel>

                  <FormControl>
                    <Input placeholder="custom_template.md" {...field} />
                  </FormControl>

                  <FormDescription>
                    Markdown template file.
                    <br />
                    Stored in{' '}
                    <code className="text-[0.95em]">
                      PULL_REQUEST_TEMPLATES
                    </code>{' '}
                    directory within the root,{' '}
                    <code className="text-[0.95em]">docs/</code> or{' '}
                    <code className="text-[0.95em]">.github/</code>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          {mode === 'body' ? (
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>PR body</FormLabel>

                  <FormControl>
                    {/* <div className="group"> */}
                    <CodeEditor
                      language="markdown"
                      className={'[&>.w-tc-editor-preview]:min-h-60! min-w-0'}
                      placeholder={`# Some cool PR

This is a **very** cool PR.
Check [this](https://example.com) out !.`}
                      {...field}
                    />
                    {/* </div> */}
                  </FormControl>

                  <FormDescription>
                    Raw body of the pull request.
                    <br />
                    Markdown is supported.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <FormItem className="md:col-span-2 mt-6">
            <FormLabel className="text-xl">
              Result{url != null ? <Sparkles className="size-5" /> : null}
            </FormLabel>

            <FormControl>
              <>
                <div className="relative min-w-0">
                  <Textarea
                    rows={1}
                    className="resize-none font-mono min-h-0"
                    placeholder="https://github.com/colinhacks/zod/pull/new"
                    value={url ?? ''}
                    disabled={url == null}
                    readOnly
                  />

                  <Button
                    className="absolute right-0 mt-0.5 mr-0.75 top-px"
                    variant="ghost"
                    size="sm"
                    disabled={url == null}
                    onClick={handleCopy}
                  >
                    <ClipboardCopy className="size-4" />
                    copy
                  </Button>
                </div>
              </>
            </FormControl>
          </FormItem>

          <div className={url == null ? 'text-muted-foreground' : undefined}>
            Or drag{' '}
            <Badge
              asChild
              className={cn(
                'select-none mx-1',
                url == null ? 'cursor-not-allowed' : 'cursor-move',
                url == null ? 'opacity-50' : undefined,
              )}
            >
              {url != null ? (
                <a
                  href={url}
                  className="after:content-['me']"
                  title={`PR${formValues.title != null ? `: ${formValues.title}` : ''}`}
                >
                  <span className="hidden">{`PR${formValues.title != null ? `: ${formValues.title}` : ''}`}</span>
                </a>
              ) : (
                <span>me</span>
              )}
            </Badge>{' '}
            on your bookmarks.
          </div>
        </form>
      </Form>
    </div>
  )
}
