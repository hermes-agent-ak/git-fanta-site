import { useState } from "react";
import type { ReactElement } from "react";

import type { DownloadAssetView } from "../../lib/downloads";

export type DownloadSelectorProps = Readonly<{
  assets: readonly DownloadAssetView[];
}>;

function availableAssets(assets: readonly DownloadAssetView[]) {
  return assets.filter((asset) => asset.availability === "available");
}

export default function DownloadSelector({
  assets,
}: DownloadSelectorProps): ReactElement {
  const available = availableAssets(assets);
  const firstRecommended = available.find((asset) => asset.recommended);
  const [selectedId, setSelectedId] = useState<number | null>(
    firstRecommended?.id ?? available[0]?.id ?? null,
  );
  const selected = available.find((asset) => asset.id === selectedId);

  return (
    <div className="download-selector" data-download-selector>
      <fieldset>
        <legend>Select a platform or artifact</legend>
        <div className="download-selector__options">
          {available.map((asset, index) => {
            const inputId = `download-artifact-${asset.id ?? index}`;

            return (
              <div className="download-selector__option" key={asset.id}>
                <input
                  id={inputId}
                  type="radio"
                  name="download-artifact"
                  value={asset.id ?? ""}
                  checked={asset.id === selectedId}
                  onChange={() => setSelectedId(asset.id)}
                />
                <label htmlFor={inputId}>
                  Download {asset.platformLabel} / {asset.artifactLabel}
                  <small>
                    {asset.fileName} · {asset.sizeLabel}
                    {asset.recommended ? " · Recommended" : ""}
                  </small>
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <p className="download-selector__status" aria-live="polite">
        {selected
          ? `Selected ${selected.platformLabel} ${selected.artifactLabel}.`
          : "No downloadable artifact is available in this release."}
      </p>

      {selected?.downloadUrl && (
        <a
          className="download-selector__action"
          href={selected.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Download ${selected.platformLabel} ${selected.artifactLabel} ${selected.fileName}`}
        >
          Download {selected.fileName}
        </a>
      )}
    </div>
  );
}
