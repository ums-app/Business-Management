import { t } from "i18next"

export function downloadFileFromApi(url) {
  let fileName = url.split("/")
  fileName = fileName[fileName.length - 1]
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}


export function seperateAndTranslateWords(key) {
  let lableName = t(key);
  const bigLetterIndex = key.split("").findIndex((letter) => {
    return letter.charCodeAt(0) < 97;
  });
  if (bigLetterIndex > -1) {
    let words = key.split(key.charAt(bigLetterIndex));
    lableName = `${t((key.charAt(bigLetterIndex) + words[1]).toLowerCase())} ${t(words[0].toLowerCase())}`;

  }

  return lableName;

}
