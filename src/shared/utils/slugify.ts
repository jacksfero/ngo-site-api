// utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces & non-word chars with `-`
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/*
async generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;

  while (await this.productRepository.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`;
  }

  return slug;
}
 // Add Image Upload Validation (Extension/Size)
fileFilter: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    return cb(new Error('Only JPG and PNG images are allowed'), false);
  }
  cb(null, true);
},
limits: {
  fileSize: 2 * 1024 * 1024, // 2MB max
}

Slug Generation on Create (Optional)

If you store a slug field for SEO or URLs, auto-generate it:

const slug = await this.generateUniqueSlug(dto.name);
product.slug = slug;

5. Handle defaultImage if Replaced

If a user uploads a new default image, you should delete the old file:

if (product.defaultImage) {
  const fullPath = path.join(process.cwd(), product.defaultImage);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}
You could wrap this logic inside a replaceDefaultImage(product, newFile) helper.


*/