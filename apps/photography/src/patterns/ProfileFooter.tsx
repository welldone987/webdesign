export function ProfileFooter() {
  return (
    <footer className="border-t border-black/12 bg-white px-5 py-14 sm:px-8">
      <section className="mx-auto max-w-[1500px] text-center" id="profile">
        <p className="text-sm text-black/36">Profile:</p>
        <p className="font-serif mx-auto mt-6 max-w-4xl text-2xl leading-10 text-black/70 sm:text-3xl sm:leading-[1.7]">
          拍摄是整理记忆的方式，
          <br />
          偏好安静的光、可停留的细节，
          <br />
          以及画面里没有被立即说完的部分。
        </p>
      </section>
      <p className="mt-14 text-center text-[0.68rem] tracking-[0.12em] text-black/38">
        ©2026 InNothing. All Rights Reserved.
      </p>
    </footer>
  );
}
