import {test, assert, expect} from 'vitest'
import Master from '@/modules/Masters/DiagnosisMaster.js'

const master = new Master()

test('ツリー構造のチェック', () => {
  const categories = master.Categories()
  expect(categories.length).toBeGreaterThan(0)

  for(const category of categories) {
    const targets = master.Targets(category)
    expect(targets.length).toBeGreaterThan(0)

    for(const target of targets) {
      const items = master.Items(category, target)
      expect(items.length).toBeGreaterThan(0)
    }
  }
})

test('内容の整合性チェック', () => {
  const categories = master.Categories()

  const itemCollection = []
  for(const category of categories) {
    const targets = master.Targets(category)
    for(const target of targets) {
      const items = master.Items(category, target)
      expect(items.length).toBeGreaterThan(0)

      for(const item of items) {
        const index = itemCollection.findIndex(
          element => Master.parseItem(element) === Master.parseItem(item)
        )

        if (index === -1) {
          itemCollection.push(item)
        } else {
          // 同じ診断名の検索ICDコードが違っていないか確認する
          const itemCode = (Master.parseItem(item, 'Code') || []).sort()
          const collectionCode = (Master.parseItem(itemCollection[index], 'Code') || []).sort()

          assert(itemCode.join(',') === collectionCode.join(','),
          'ICDコードの不整合が見つかりました。\n' +
          `カテゴリ:${category} 対象臓器:${target} - ${Master.parseItem(item)}`
          )
        }
      }
    }
  }
})
