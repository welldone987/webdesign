export function AboutPhotography() {
  return (
    <section className="border-y border-stone-800 bg-stone-950 px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="font-serif text-4xl text-stone-50 sm:text-5xl">关于这组影像</h2>
        <div className="max-w-2xl space-y-5 text-lg leading-8 text-stone-300">
          <p>
            这个站点作为摄影作品的长期索引，重点是让图片、分类和基础信息保持清楚。后续新增作品时优先更新图片和
            <code className="mx-1 bg-stone-800 px-1.5 py-0.5 text-sm">photos.json</code>
            ，组件结构保持稳定。
          </p>
          <p>
            第一版不接入访问统计，不收集访客数据。图片上线前应先压缩为适合网页展示的尺寸，并补充明确的替代文本。
          </p>
        </div>
      </div>
    </section>
  );
}
