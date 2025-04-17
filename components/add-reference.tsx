"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadItemProgress,
	FileUploadList,
	FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadFiles } from "@/lib/uploadthing";
import { Upload, X } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";
import { addWebsiteReference } from "../actions/websites";

export function AddReference({
	children,
}: Readonly<{
	children?: React.ReactNode;
}>) {
	const [isUploading, setIsUploading] = React.useState(false);
	const [files, setFiles] = React.useState<File[]>([]);
	const [open, setOpen] = React.useState(false);
	const [url, setUrl] = React.useState("");
	const [state, formAction, isPendingAddWebsiteReferenceAction] =
		useActionState(addWebsiteReference, undefined);

	const onUpload = React.useCallback(
		async (
			files: File[],
			{
				onProgress,
			}: {
				onProgress: (file: File, progress: number) => void;
			},
		) => {
			try {
				setIsUploading(true);
				const res = await uploadFiles("documentUploader", {
					files,
					onUploadProgress: ({ file, progress }) => {
						onProgress(file, progress);
					},
				});

				toast.success("Uploaded files:", {
					description: (
						<pre className="mt-2 w-80 rounded-md bg-accent/30 p-4 text-accent-foreground">
							<code>
								{JSON.stringify(
									res.map((file) =>
										file.name.length > 25
											? `${file.name.slice(0, 25)}...`
											: file.name,
									),
									null,
									2,
								)}
							</code>
						</pre>
					),
				});

				// Close the dialog after 2 seconds
				setTimeout(() => {
					setOpen(false);
				}, 2000);
			} catch (error) {
				setIsUploading(false);

				if (error instanceof UploadThingError) {
					const errorMessage =
						error.data && "error" in error.data
							? error.data.error
							: "Upload failed";
					toast.error(errorMessage);
					return;
				}

				toast.error(
					error instanceof Error ? error.message : "An unknown error occurred",
				);
			} finally {
				setIsUploading(false);
			}
		},
		[],
	);

	const onFileReject = React.useCallback((file: File, message: string) => {
		toast(message, {
			description: `"${
				file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
			}" has been rejected`,
		});
	}, []);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || <Button variant="outline">Add Reference</Button>}
			</DialogTrigger>
			<DialogContent title="Add Reference" className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Reference</DialogTitle>
				</DialogHeader>
				<form action={formAction} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="url">Website URL</Label>
						<Input
							id="url"
							name="url"
							type="url"
							placeholder="https://example.com"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							disabled={isPendingAddWebsiteReferenceAction || isUploading}
						/>
					</div>
					<Button
						type="submit"
						disabled={!url || isPendingAddWebsiteReferenceAction || isUploading}
						variant="outline"
						size="sm"
						className="w-full"
					>
						{isPendingAddWebsiteReferenceAction
							? "Adding..."
							: "Add Website Reference"}
					</Button>
				</form>
				<div className="relative my-4">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or upload a file
						</span>
					</div>
				</div>
				<FileUpload
					accept=".pdf,.docx,.xlsx,.pptx,.txt,.md"
					maxFiles={1}
					maxSize={16 * 1024 * 1024}
					className="w-full max-w-md"
					onAccept={(files) => setFiles(files)}
					onUpload={onUpload}
					onFileReject={onFileReject}
					multiple={false}
					disabled={isUploading || isPendingAddWebsiteReferenceAction}
				>
					<FileUploadDropzone>
						<div className="flex flex-col items-center gap-1">
							<div className="flex items-center justify-center rounded-full border p-2.5">
								<Upload className="size-6 text-muted-foreground" />
							</div>
							<p className="font-medium text-sm">Drag & drop documents here</p>
							<p className="text-muted-foreground text-xs">
								Or click to browse (PDF, Word, Excel, PowerPoint, TXT, Markdown)
							</p>
						</div>
						<FileUploadTrigger asChild>
							<Button variant="outline" size="sm" className="mt-2 w-fit">
								Browse files
							</Button>
						</FileUploadTrigger>
					</FileUploadDropzone>
					<FileUploadList>
						{files.map((file) => (
							<FileUploadItem key={file.lastModified} value={file}>
								<div className="flex w-full items-center gap-2">
									<FileUploadItemPreview />
									<FileUploadItemMetadata />
									<FileUploadItemDelete asChild>
										<Button variant="ghost" size="icon" className="size-7">
											<X />
										</Button>
									</FileUploadItemDelete>
								</div>
								<FileUploadItemProgress />
							</FileUploadItem>
						))}
					</FileUploadList>
				</FileUpload>
			</DialogContent>
		</Dialog>
	);
}
