export function ProfileFooter() {
  return (
    <footer className="border-t border-black/12 bg-white px-5 py-10 sm:px-8">
      <section className="mx-auto max-w-[1500px] text-center" id="profile">
        <p className="font-serif mx-auto max-w-4xl text-xl leading-8 text-black/70 sm:text-[1.35rem] sm:leading-9">
          拍摄是整理记忆的方式，
          <br />
          偏好安静的光、可停留的细节，
          <br />
          以及画面里没有被立即说完的部分。
        </p>
      </section>
      <p className="mt-8 text-center text-[0.68rem] tracking-[0.12em] text-black/38">
        email:innothing987@163.com
      </p>
      <p className="mt-5 text-center text-[0.68rem] tracking-[0.12em] text-black/38">
        ©2026 InNothing. All Rights Reserved.
      </p>
    </footer>
  );
}
